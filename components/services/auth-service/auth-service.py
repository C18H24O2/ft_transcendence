from datetime import datetime, timedelta, timezone
import jwt
from service_runtime.service import Service, service, message
from service_runtime.models import User


JWT_SECRET = 'secret'
JWT_ALGORITHM = 'HS256'
JWT_EXP_DELTA_SECONDS = 3600 * 24 * 30 # 30 days
JWT_EXP_DELTA = timedelta(seconds=JWT_EXP_DELTA_SECONDS)

def generate_jwt(user: User) -> str:
    return jwt.encode({
        'uid': user.id, # yes id exists, shut up mypy 
        'exp': datetime.now(timezone.utc) + JWT_EXP_DELTA,
    }, JWT_SECRET, JWT_ALGORITHM)

def validate_jwt(token: str) -> tuple[bool, User | None]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload['exp'] < datetime.now(timezone.utc):
            return False, None
        return True, User.get(User.id == payload['uid']) # mypy ferme ta gueule putain
    except jwt.ExpiredSignatureError:
        pass
    except jwt.InvalidTokenError:
        pass
    except Exception as e:
        print("Error validating token", e)
    return False, None


class AuthController:
    def is_logged(self, token: str) -> tuple[bool, User | None]:
        if not token:
            return False, None
        return validate_jwt(token)

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
