# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import HttpRequest
from .decorators import memoized
import json
import os


LANGS_DIR = os.path.join(os.path.dirname(__file__), 'lang')
LANGUAGES = [
    ('en', 'English'),
    ('fr', 'Français'),
    ('cr', "Cramptés"),
]


def get_user_lang(request: HttpRequest) -> str:
    return request.COOKIES.get('ft-lang', 'en')


@memoized
def get_translate_function(request: HttpRequest) -> callable:
    lang: str = get_user_lang(request)
    filename = os.path.join(LANGS_DIR, f'{lang}.json')

    if not os.path.exists(filename):
        lang = 'en'
        filename = os.path.join(LANGS_DIR, f'{lang}.json')

    try:
        with open(filename, 'r') as f:
            data = json.load(f)

            def translate(text: str) -> str:
                keys = text.split('.')
                try:
                    if len(keys) == 1:
                        return data.get(text, text)
                    else:
                        current = data
                        for key in keys:
                            current = current.get(key, {})
                        return current.get(keys[-1], text)
                except Exception as e:
                    print("Error translating", text, e)
                    return text
            return translate
    except Exception as e:
        print("Error loading language file", e)
    return lambda text: text
