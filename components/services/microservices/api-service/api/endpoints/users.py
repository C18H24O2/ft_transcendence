# -*- coding: utf-8 -*-

import sys
from ..flango import get, post
from django.http import HttpRequest
from service_runtime.remote_service import remote_service
from service_runtime.models import User


AuthService = remote_service("auth-service")
# UserService = remote_service("user-service", ["get_user"])


@get("/user")
def get_self(request: HttpRequest) -> dict:
    token = request.COOKIES.get("x-ft-tkn", None)
    if token is None:
        return {"error": "unauthorized"}
    try:
        valid = AuthService.is_valid_token(token=token)
        if not valid:
            return {"error": "unauthorized"}
        user = AuthService.get_user(token=token)
        if user is not None:
            del user["passwordHash"]
            del user["totpSecret"]
            return user
        return {"error": "unknown"}
    except Exception as e:
        print("get_self error:", e, file=sys.stderr)
        return {"error": "server_error"}
