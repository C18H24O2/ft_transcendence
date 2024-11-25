# -*- coding: utf-8 -*-

from functools import wraps


def __find_params(path):
    """
    Find all parameters in the path.

    Example:
        /users/{id:int}/posts/{post_slug:str}

    Returns:
        [
            ("users", None),
            ("id", ("id", "int")),
            ("posts", None),
            ("post_slug", ("post_slug", "str"))
        ]
    """
    if path.startswith("/"):
        path = path[1:]

    paths = path.split("/")
    params = []
    for path in paths:
        has_param = path.startswith("{") and path.endswith("}")
        if not has_param:
            if "{" in path or "}" in path:
                raise ValueError(f"Invalid param '{path}', url params must be separte in their own part")
            params.append((path, None))
        else:
            print("we doing a biggie", path)
            param = path.split("{")[1].split("}")[0]
            param_type = None
            if ":" in param:
                (param, param_type) = param.split(":")
            params.append((path, (param, param_type)))
    return params


def __create_decorator(path, name, params):
    def decorator(func):
        func._flango_method = name
        func._flango_params = params
        func._flango_route = path
        @wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        return wrapper
    return decorator


def __create_decorator_fn(name):
    def decorator_fn(path):
        print("Creating", name, "handler for", path)
        params = __find_params(path)
        print("Found params", params)
        return __create_decorator(path, name, params)
    return decorator_fn


get = __create_decorator_fn("GET")
post = __create_decorator_fn("POST")
put = __create_decorator_fn("PUT")
delete = __create_decorator_fn("DELETE")
patch = __create_decorator_fn("PATCH")

# fuck the other verbs, i hate them

