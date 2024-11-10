#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from django.core.management.utils import get_random_secret_key
from django.http import HttpResponse, HttpRequest
# from django.shortcuts import redirect
from django.shortcuts import render
from django.urls import re_path
import os


DEBUG = True
SECRET_KEY = os.environ.get('DJANGO_SECRET', get_random_secret_key())
ROOT_URLCONF = __name__

INSTALLED_APPS = [
    "django.contrib.staticfiles",
]
TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [
        '/app/dist/',
        'frontend/dist/',
    ],
}]
STATICFILES_DIRS = [
    "/app/dist/static/",
    "frontend/dist/static",
]
STATIC_URL = 'static/'


def _find_template(
    request: HttpRequest,
    path: str | None = None
) -> HttpResponse | None:
    path = request.path if path is None else path
    if path.startswith('/'):
        path = path[1:]
    for staticpath in TEMPLATES[0]["DIRS"]:
        target = staticpath + path
        if os.path.exists(target):
            abs = os.path.abspath(target)
            # if it's a directory, add /index.html
            if os.path.isdir(abs):
                abs = os.path.join(abs, 'index.html')
            return render(request, abs)
    return None


def find_template(request: HttpRequest) -> HttpResponse:
    template = _find_template(request)
    if template is None:
        template = _find_template(request, path='404.html')
        if template is None:
            return HttpResponse(
                "Not found.",
                status=200,
                content_type='text/plain'
            )
    return template


def home(request):
    if request.path.endswith('/'):
        request.path += 'index.html'
    return find_template(request)


urlpatterns = [
    # path('.*', home, name='home'),
    # Regex to anything that doesnt start with /static/
    re_path(r'^(?!static/).*', home),
]
