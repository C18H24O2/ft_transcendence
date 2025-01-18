from service_runtime.service import service, message
from service_runtime.remote_service import remote_service
from service_runtime.models import User

AuthService = remote_service("auth-service")


# class UserController:
#     def create_user(self, username: str, email: str, password: str) -> str:
#         return User.create(
#             username=username,
#             email=email,
#             passwordHash=passwordHash,
#             displayName=username,
#             profilePicture=""
#         )
#
#
# @service(id="user-service")
# class UserService(Service):
#     def __init__(self):
#         self.controller = UserController()
#
#     @message("create_user")
#     # @require_user_context
#     def create_user(self, username: str, email: str, passwordHash: str) -> User:
#         """
#         {
#             "message": "create_user",
#             "context: { "user_token": "token" }",
#             "data": {
#                 "username": "username",
#                 "email": "email",
#                 "passwordHash": "password"
#             }
#         """
#         return self.controller.create_user(username, email, passwordHash)
#
#     # @message("get_user")
#     # def get_user(self, username: str) -> str:
#     #     return query("SELECT * FROM users WHERE username = ?", [username])
#
