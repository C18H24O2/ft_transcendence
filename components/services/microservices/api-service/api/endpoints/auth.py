from ..flango import get, post
from django.http import HttpRequest


@post("/auth/login")
def login(request: HttpRequest) -> object:
    return "Hello, world!"


@post("/auth/register")
def register(request: HttpRequest) -> object:
    return "Hello, world!"
