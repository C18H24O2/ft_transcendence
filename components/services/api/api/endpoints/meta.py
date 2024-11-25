from django.http import HttpRequest
from ..flango import get

@get("/")
def get_meta(request: HttpRequest) -> object:
    return {
        "name": "ft_trans-api",
        "version": "0.0.1",
    }
