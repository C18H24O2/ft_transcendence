from service_runtime.service import message
from controller import validate_jwt


@message
def is_logged(token: str) -> bool:
    return True
    # return validate_jwt(token)[0]


service_name = "auth-service"
