from django.core.management.utils import get_random_secret_key
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_URLCONF = __name__
SECRET_KEY = os.environ.get('DJANGO_SECRET', get_random_secret_key())
DEBUG = False
ALLOWED_HOSTS = ['*']
urlpatterns = []

# Application definition
INSTALLED_APPS = [
    'daphne',
    'chat',
    'django.contrib.contenttypes',
]

ASGI_APPLICATION = "chat_service.asgi.application"
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6942)],
        },
    },
}

# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = False
USE_TZ = False

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
