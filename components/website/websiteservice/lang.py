# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import HttpRequest
import json
import os


LANGS_DIR = os.path.join(os.path.dirname(__file__), 'lang')
LANGUAGES = [
    ('en', 'English'),
    ('fr', 'Français'),
    ('x-crmt', "Cramptés"),
    ('x-crmt', "Español"),
]


def get_user_lang(request: HttpRequest) -> str:
    return request.COOKIES.get('ft-lang', 'en')


def get_translate_function(lang: str) -> callable:
    filename = os.path.join(LANGS_DIR, f'{lang}.json')

    if not os.path.exists(filename):
        lang = 'en'
        filename = os.path.join(LANGS_DIR, f'{lang}.json')

    try:
        with open(filename, 'r') as f:
            data = json.load(f)

            def translate(text: str) -> str:
                print("Translating", text)
                keys = text.split('.')
                try:
                    if len(keys) == 1:
                        return data.get(text, text)
                    else:
                        current = data
                        for key in keys:
                            print("getting", key, "from", current)
                            current = current.get(key, {})
                        print("got", current)
                        return str(current)
                except Exception as e:
                    print("Error translating", text, e)
                    return text
            return translate
    except Exception as e:
        print("Error loading language file", e)
    return lambda text: text
