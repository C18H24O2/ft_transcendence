# -*- coding: utf-8 -*-

from ..flango import get, post
from django.http import HttpRequest
# from service_runtime.remote_service import remote_service
from service_runtime.models import User


# AuthService = remote_service("auth-service", ["is_logged"])
# UserService = remote_service("user-service", ["get_user"])


@get("/user/{id:int}")
def get_user(request: HttpRequest, id: int) -> object:
    return {
        "user": "Hello, world!",
        "id": id,
    }
