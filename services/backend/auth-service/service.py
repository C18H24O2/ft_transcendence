from datetime import datetime, timedelta
import jwt
from service_runtime import Service, ServiceQueue 


JWT_SECRET = 'your_secret_key'
JWT_ALGORITHM = 'HS256'
JWT_EXP_DELTA_SECONDS = 3600


class AuthController:
    def authenticate(self, username: str, password: str) -> str:
        if username == "admin" and password == "password":
            return "success"
        return "failure"


class AuthService(Service):
    def __init__(self, queue: ServiceQueue):
        super().__init__("auth-service", queue)
        self.__controller = AuthController()
        queue.declare("auth")

    def run(self):
        pass


if __name__ == "__main__":
    Service.run(AuthService)