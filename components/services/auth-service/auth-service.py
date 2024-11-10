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
    queue_id: str

    def __init__(self):
        super().__init__("auth-service", ServiceQueue())
        assert self.queue is not None

        self.__controller = AuthController()

        self.queue_id = self.queue.declare_queue("auth")

        self.queue.add_consumer(self.queue_id, self.handle_message)

    """
    {
        "message_type": ""
    }
    """
        
    def handle_message(self, channel, method, properties, body):
        print("Received message")
        print(f"Channel: {channel}")
        print(f"Method: {method}")
        print(f"Properties: {properties}")
        print(f"Body: {body}")
        response = self.__controller.authenticate("admin", "password")

    def launch(self):
        print("Auth service launched")
        with self.queue as queue:
            queue.consume()
        

def launch():
    Service.run(AuthService)
