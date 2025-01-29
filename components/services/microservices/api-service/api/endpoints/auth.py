from ..flango import get, post
from django.http import HttpRequest, HttpResponse
from django.shortcuts import redirect
from service_runtime.remote_service import remote_service


AuthService = remote_service("auth-service")


@get("/auth/login")
def login_redir(request: HttpRequest) -> HttpResponse:
    return redirect("/login")


@get("/auth/register")
def register_redir(request: HttpRequest) -> HttpResponse:
    return redirect("/register")


@get("/auth/logout")
def logout_redir(request: HttpRequest) -> HttpResponse:
    r = redirect("/")
    r.delete_cookie("x-ft-tkn")
    return r


@post("/auth/login")
def login(request: HttpRequest) -> dict:
    try:
        json = request.body.decode("utf-8")
        data = json.loads(json)
        required_fields = ["username", "password", "totp_code"]
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return {"error": "Missing required field(s)", "missing_fields": missing_fields}
        return AuthService.login(
            data["username"],
            data["password"],
            data["totp_code"]
        )
    except Exception:
        return {"error": "Invalid request body"}


@post("/auth/register")
def register(request: HttpRequest) -> dict:
    try:
        json = request.body.decode("utf-8")
        data = json.loads(json)
        required_fields = ["username", "password", "totp_secret", "totp_code"]
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return {"error": "Missing required field(s)", "missing_fields": missing_fields}
        return AuthService.register(
            data["username"],
            data["password"],
            data["totp_secret"],
            data["totp_code"]
        )
    except Exception:
        return {"error": "Invalid request body"}
