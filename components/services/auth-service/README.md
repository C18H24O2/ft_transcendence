# ft_trans's auth-service

> A service for authenticating users

## Usage

```python
from service_runtime import Target

auth_service = ServiceQueue("auth-service")
auth_service.declare("auth")

def auth(username: str, password: str) -> bool:
    response = auth_service.send("auth", username, password)