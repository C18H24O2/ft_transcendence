# -*- coding: utf-8 -*-
from django import template
from ..lang import get_translate_function

register = template.Library()


@register.simple_tag(name="translate", takes_context=True)
def translate(context, value):
    print("Translating:", value)
    try:
        actual = 
        for ctx in context:
            print("\n", ctx, "\n")
        # lang = ctx.website_title
        # trans = get_translate_function(lang)
        # return trans(value)
    except Exception as e:
        print("Error:", e)
        pass
    return value
