# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import HttpRequest
import json
import os


LANGS_DIR = os.path.join(os.path.dirname(__file__), 'lang')
LANGUAGES = []

lang_data = {}
lang_functions = {}


def get_user_lang(request: HttpRequest) -> str:
    return request.COOKIES.get('ft-lang', 'en')


def get_translate_function(lang: str) -> callable:
    global lang_functions
    if lang not in lang_functions:
        lang_functions[lang] = _get_translate_function(lang)
    return lang_functions[lang]


def _get_translate_function(lang: str) -> callable:
    global lang_data
    filename = os.path.join(LANGS_DIR, f'{lang}.json')

    if not os.path.exists(filename):
        lang = 'en'
        filename = os.path.join(LANGS_DIR, f'{lang}.json')

    try:
        if lang not in lang_data:
            with open(filename, 'r') as f:
                lang_data[lang] = json.load(f)
        data = lang_data[lang] or {}

        def translate(text: str) -> str:
            keys = text.split('.')
            try:
                if len(keys) == 1:
                    return data.get(text, text)
                else:
                    current = data
                    for key in keys:
                        current = current.get(key, {})
                    if len(current) == 0:
                        print("Warning: Missing translation for", text)
                        return text
                    return str(current)
            except Exception as e:
                print("Error translating", text, e)
                return text
        return translate
    except Exception as e:
        print("Error loading language file:", e)
    return lambda text: text


if len(LANGUAGES) == 0:
    for filename in os.listdir(LANGS_DIR):
        if filename.endswith('.json'):
            lang = filename[:-5]
            print("Loading language", lang)
            fn = get_translate_function(lang)
            name = fn("__lang_name")
            print("Discovered language", lang, "with name", name)
            LANGUAGES.append((lang, name))
