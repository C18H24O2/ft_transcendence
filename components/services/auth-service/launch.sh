#!/usr/bin/env bash

source ../../../.env

export POSTGRES_USER
export POSTGRES_PASSWORD
export POSTGRES_DB

python3 ../service-runtime/launcher.py auth-service.py
