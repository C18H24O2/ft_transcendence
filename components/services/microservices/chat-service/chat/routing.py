# chat/routing.py
from django.urls import re_path, path

from . import consumers

websocket_urlpatterns = [
    re_path(r".*", consumers.ChatConsumer.as_asgi()),
    # match everything
    path("", consumers.ChatConsumer.as_asgi()),
]
