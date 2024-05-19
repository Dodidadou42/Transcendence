from django.urls import re_path

from .consumers import ChatConsumer

websocket_urlpatterns = [
    re_path('api/websocket/chat/', ChatConsumer.as_asgi()),
]