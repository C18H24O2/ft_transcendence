#!/usr/bin/env bash
pnpm run -C frontend build
python3 manage.py runserver 0.0.0.0:42069
