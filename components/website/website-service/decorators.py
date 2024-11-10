# -*- coding: utf-8 -*-

from django.shortcuts import render


def template(template_name):
    def decorator(func):
        def wrapper(request, *args, **kwargs):
            context = func(request, *args, **kwargs)
            return render(request, template_name, context)
        return wrapper
    return decorator
