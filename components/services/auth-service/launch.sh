#!/usr/bin/env bash

source ../../../.env

export POSTGRES_USER
export POSTGRES_PASSWORD
export POSTGRES_DB

docker compose -f ../postgres.docker-compose.yml up -d

python3 ../service-runtime/launcher.py auth-service.py
