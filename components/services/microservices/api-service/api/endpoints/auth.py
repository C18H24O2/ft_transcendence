from ..flango import get, post
from django.http import HttpRequest, HttpResponse
from django.shortcuts import redirect
from service_runtime.remote_service import remote_service
import sys
import json


AuthService = remote_service("auth-service")


@get("/auth/oauth-callback")
def oauth_callback(request: HttpRequest) -> HttpResponse:
    try:
        code = request.GET["code"]
        if code is None or code == "":
            raise ValueError("code is empty")

        res = AuthService.get_or_create_42(code=code)

        if "error" in res:
            return redirect(f"/login?error={res['error']}")

        if "token" in res:
            r = redirect("/")
            r.set_cookie("x-ft-tkn", res["token"], max_age=3600 * 24 * 30)
            return r

        raise ValueError("No token in response: " + str(res))
    except Exception as e:
        print("Oauth callback error:", e, file=sys.stderr)
        return redirect("/login?error=server_error")


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
        json_str = request.body.decode("utf-8")
        data = json.loads(json_str)
        required_fields = ["username", "password", "totp_code"]
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return {"error": "Missing required field(s)", "missing_fields": missing_fields}
        return AuthService.login(
            username=data["username"],
            password=data["password"],
            totp_code=data["totp_code"]
        )
    except Exception as e:
        print("Error:", e, file=sys.stderr)
        return {"error": "Invalid request body"}


@post("/auth/register")
def register(request: HttpRequest) -> dict:
    try:
        json_str = request.body.decode("utf-8")
        data = json.loads(json_str)
        required_fields = ["username", "password", "totp_secret", "totp_code"]
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return {"error": "Missing required field(s)", "missing_fields": missing_fields}
        return AuthService.register(
            username=data["username"],
            password=data["password"],
            totp_secret=data["totp_secret"],
            totp_code=data["totp_code"]
        )
    except Exception as e:
        print("Error:", e, file=sys.stderr)
        return {"error": "Invalid request body"}
