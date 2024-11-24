# -*- coding: utf-8 -*-
from django import template
from ..lang import get_translate_function

register = template.Library()


@register.simple_tag(name="translate", takes_context=True)
def translate(context, value):
    try:
        lang = context["lang"]
        trans = get_translate_function(lang)
        return trans(value)
    except Exception as e:
        print("translate_tag error:", e)
    return value
