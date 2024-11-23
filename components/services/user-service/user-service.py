from service_runtime.service import Service, service, message
from service_runtime.remote_service import remote_service
# from service_runtime.database import query

AuthService = remote_service("auth-service", ["is_logged"])


class UserController:
    def create_user(self, username: str, email: str, password: str) -> str:
        return "success"


@service(id="user-service")
class UserService(Service):
    def __init__(self):
        self.controller = UserController()

    @message("create_user")
    def create_user(self, username: str, email: str, passwordHash: str) -> str:
        return self.controller.create_user(username, email, passwordHash)

    # @message("get_user")
    # def get_user(self, username: str) -> str:
    #     return query("SELECT * FROM users WHERE username = ?", [username])

