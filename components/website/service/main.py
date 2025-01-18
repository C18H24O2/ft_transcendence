#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from django.core.management.utils import get_random_secret_key
from django.http import HttpResponse, HttpRequest
from django.shortcuts import render
from django.urls import re_path
from .lang import LANGUAGES, get_user_lang, get_translate_function
import os
import json


DEBUG = False
SECRET_KEY = os.environ.get('DJANGO_SECRET', get_random_secret_key())
ROOT_URLCONF = __name__

ALLOWED_HOSTS = ['*']
INSTALLED_APPS = [
    # "django.contrib.staticfiles",
    "service",
]
TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [
        '/app/dist/',
        'frontend/dist/',
    ],
}]
STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]
STATICFILES_DIRS = [  # Sorry mom and dad.
    "/app/dist/static",
    "/app/dist/assets",
    "/app/dist",
    "/app/static",
    "/app",
    "frontend/dist/static",
    "frontend/dist/assets",
    "frontend/dist",
    "frontend/static",
    "frontend"
]
STATIC_ROOT = '/app/static/'
STATIC_URL = 'static/'


def _find_template(
    request: HttpRequest,
    context: dict = {},
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
            # print(abs)
            return render(request, abs, context)
    return None


def find_template(request: HttpRequest, context: dict) -> HttpResponse:
    template = _find_template(request, context=context)
    if template is None:
        template = _find_template(request, context=context, path='404.html')
        if template is None:
            import json
            return HttpResponse(
                json.dumps({'error': 'Not found', 'status': 404}), # mypy: ignore
                status=404,
                content_type='text/json'
            )
    return template


def main(_request):
    title = _request.path
    if title.startswith('/'):
        title = title[1:]
    if title.endswith('/'):
        title = title[:-1]
    title = title.replace('/', '.')
    if title == '':
        title = 'main'
    # print("Title:", title)

    if _request.path.endswith('/'):
        _request.path += 'index.html'

    user_lang = get_user_lang(_request)
    translate = get_translate_function(user_lang)
    page_title = translate(f'title.{title}')
    context = {
        'website_title': 'ft_trans',
        'title': page_title,
        'languages': LANGUAGES,
        'lang': user_lang,
    }

    return find_template(_request, context)

def fetch_resource_dumb(request, idk):
    for search_path in STATICFILES_DIRS:
        target = search_path + request.path
        if os.path.exists(target):
            abs = os.path.abspath(target)
            extension = abs.split('.')[-1]
            type = 'application/octet-stream'
            if extension == 'js':
                type = 'text/javascript'
            elif extension == 'css':
                type = 'text/css'
            elif extension == 'html':
                type = 'text/html'
            elif extension == 'ico':
                type = 'image/x-icon'
            elif extension == 'png':
                type = 'image/png'
            elif extension == 'jpg':
                type = 'image/jpeg'
            elif extension == 'svg':
                type = 'image/svg+xml'
            elif extension == 'webp':
                type = 'image/webp'
            elif extension == 'woff':
                type = 'font/woff'
            elif extension == 'woff2':
                type = 'font/woff2'
            elif extension == 'ttf':
                type = 'font/ttf'
            elif extension == 'otf':
                type = 'font/otf'
            try:
                with open(abs, 'rb') as f:
                    return HttpResponse(f.read(), content_type=type)
            except Exception:
                pass
    return HttpResponse(
        json.dumps({'error': 'Not found', 'status': 404}), # mypy: ignore
        status=404,
        content_type='text/json'
    )


urlpatterns = [
    # Regex to anything that doesnt start with /static/
    re_path(r'^(static\/|assets\/|favicon\.ico).*', fetch_resource_dumb),
    re_path(r'^(?!static\/|assets\/|favicon\.ico).*', main),
]

# Anything else should be served from the static directory
# (see `django.contrib.staticfiles`)
