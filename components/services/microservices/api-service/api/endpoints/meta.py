from django.http import HttpRequest
from ..flango import get
import uuid

state_id = uuid.uuid4()

@get("/")
def get_meta(request: HttpRequest) -> object:
    return {
        "name": "ft_trans-api",
        "version": "0.0.1",
        "instance_id": str(state_id),
    }
