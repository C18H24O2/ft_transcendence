from datetime import datetime, timedelta
import jwt
from service_runtime.service import Service, service, message
from service_runtime.models import User


JWT_SECRET = 'your_secret_key'
JWT_ALGORITHM = 'HS256'
JWT_EXP_DELTA_SECONDS = 3600


class AuthController:
    def authenticate(self, username: str, password: str) -> str:
        if username == "admin" and password == "password":
            return "success"
        return "failure"


@service(id="auth-service")
class AuthService(Service):
    def __init__(self):
        self.controller = AuthController()

    @message("login")
    def login(self, username: str, password: str) -> str:
        return self.controller.authenticate(username, password)
        

def launch():
    Service.run(AuthService)
