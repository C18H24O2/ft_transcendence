# -*- coding: utf-8 -*-
"""
author: kiroussa <ft@xtrm.me>

A flask-like DSL for Django.
"""

from django.http import HttpResponse
from django.urls import re_path
from pathlib import Path
import inspect
import importlib
import json
from typing import Optional
import time
import traceback


def _wrap_handler(app):
    def handler(request, *args, **kwargs):
        return app.handle_request(request, *args, **kwargs)
    return handler


class FlangoHandler:
    def __init__(self, name, method, paths, fn):
        self.name = name
        self.method = method
        self.paths = paths
        self.known_param_types = ['int', 'str']
        for e in [ValueError(f"Unknown param type '{param_type[1]}'") for (_, param_type) in paths if param_type is not None and param_type[1] not in self.known_param_types]:
            raise e
        self.fn = fn

    def matches_method(self, request):
        return self.method == request.method

    def _parse_type(self, param_type: Optional[str], target: str):
        if param_type is None:
            param_type = 'str'

        if param_type == 'int':
            try:
                return int(target)
            except ValueError:
                return None
        elif param_type == 'str':
            return str(target)
        return None

    def matches_part(self, part, path):
        if path[1] is None:
            return part == path[0]
        (_, param_type) = path[1]
        return self._parse_type(param_type, part) != None

    def matches_path(self, request):
        path = request.path
        if path.startswith('/'):
            path = path[1:]
        if path.endswith('/'):
            path = path[:-1]
        paths = path.split('/')
        if len(paths) != len(self.paths):
            return False
        for i, part in enumerate(paths):
            if not self.matches_part(part, self.paths[i]):
                return False
        return True
            
    def extract_params(self, path):
        if path.startswith('/'):
            path = path[1:]
        if path.endswith('/'):
            path = path[:-1]

        parts = path.split('/')
        params = []
        for i, part in enumerate(parts):
            (_, stuff) = self.paths[i]
            if stuff is None:
                continue
            (_, param_type) = stuff
            value = self._parse_type(param_type, part)
            if value is None:
                raise ValueError(f"Invalid {param_type} param '{part}'")
            params.append(value)
        return params

    def handle(self, request):
        params = self.extract_params(request.path)
        print(f"Handling {self.name} with params {params}")
        return self.fn(request, *params)


class FlangoApp:
    handlers: list[FlangoHandler]

    def __init__(self):
        self.handlers = []
        self._not_found = self._gen_error("Not found", 404)
        self._ambiguous = self._gen_error("Ambiguous route", 404)

    def _gen_error(self, msg, status) -> HttpResponse:
        # mypy: ignore
        # pyright: ignore
        return HttpResponse(json.dumps({'error': msg, 'status': status}), status=status, content_type="text/json")

    def log(self, msg, *args):
        print("[Flango]", msg, *args)

    def discover_handlers(self, module_path: str) -> None:
        # Discover all .py files in the path
        path = Path(module_path.replace(".", "/")).absolute()
        for file in path.glob("*.py"):
            relative_path = file.relative_to(path)
            module_name = module_path + "." + str(relative_path.stem)
            module = importlib.import_module(module_name)
            # get all functions in the module
            for name, obj in inspect.getmembers(module, inspect.isfunction):
                if not hasattr(obj, "_flango_method"):
                    continue
                self.add_handler(name, obj)

    def add_handler(self, name, fn):
        route = getattr(fn, "_flango_route")
        self.log(f"Adding handler '{name}' for route {route}")
        method = getattr(fn, "_flango_method")
        paths = getattr(fn, "_flango_params")
        self.handlers.append(FlangoHandler(name, method, paths, fn))

    def provide_handler(self):
        return re_path("", _wrap_handler(self))

    def handle_request(self, request, *args, **kwargs):
        try:
            time_start = time.time()
            resp = self._handle_request(request, *args, **kwargs)
            print(f"Request took {time.time() - time_start}s")
            return resp
        except Exception as e:
            self.log(f"Error while handling request:", traceback.format_exc())
            return self._gen_error(str(e), 500)

    def _handle_request(self, request, *args, **kwargs):
        # Check if any handler matches the request path
        matches_path = [handler for handler in self.handlers if handler.matches_path(request)]
        if len(matches_path) == 0:
            return self._not_found
        elif len(matches_path) > 1:
            match_method = [handler for handler in matches_path if handler.matches_method(request)]
            if len(match_method) == 0:
                # If no method matches, return a 405 with the allowed methods as per HTTP
                resp = self._gen_error("Method not allowed", 405)
                resp['Allow'] = ', '.join([handler.method for handler in matches_path])
                return resp
            return self._ambiguous
        
        # If there's only one match, check the method
        target = matches_path[0]
        if target.matches_method(request):
            # We have a match, let's hand if off to the handler
            # for it to parse and execute the request
            resp = None
            try:
                resp = target.handle(request)
            except Exception as e:
                return self._gen_error(str(e), 500)
            return self.handle_response(resp, target.fn._flango_route)
        resp = self._gen_error("Method not allowed", 405)
        resp['Allow'] = target.method
        return resp
        
    def handle_response(self, resp, name):
        if resp is None:
            return self._gen_error("Not found", 404)
        if isinstance(resp, str):
            return HttpResponse(resp, content_type="text/plain", status=200)
        if isinstance(resp, dict):
            status = 200
            if "status" in resp:
                status = int(resp["status"])
            return HttpResponse(json.dumps(resp), content_type="text/json", status=status)
        raise Exception(f"Invalid response type from handler {name}")
