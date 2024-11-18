#!/usr/bin/env bash
poetry run django-admin runserver --pythonpath=. --settings=websiteservice.main 0.0.0.0:42069
