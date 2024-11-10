#!/usr/bin/env bash
poetry run django-admin runserver --pythonpath=. --settings=website-service.main 0.0.0.0:42069
