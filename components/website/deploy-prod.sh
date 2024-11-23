#!/usr/bin/env bash

PORT="$1"
PORT="${PORT:-19765}"

pnpm run -C frontend build
# gunicorn -b 0.0.0.0:$PORT websiteservice.wsgi
python3 manage.py runserver 0.0.0.0:$PORT

