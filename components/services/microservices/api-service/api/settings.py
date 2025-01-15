from django.core.management.utils import get_random_secret_key
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.environ.get('DJANGO_SECRET', get_random_secret_key())
DEBUG = False
ALLOWED_HOSTS = ['*']
WSGI_APPLICATION = "api.wsgi.application"
ROOT_URLCONF = "api.urls"

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
