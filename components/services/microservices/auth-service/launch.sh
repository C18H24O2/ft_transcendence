#!/usr/bin/env bash

source ../../.env

export POSTGRES_USER
export POSTGRES_PASSWORD
export POSTGRES_DB

export RABBITMQ_NODE_PORT
export RABBITMQ_DEFAULT_USER
export RABBITMQ_DEFAULT_PASS
export RABBITMQ_HOST=0.0.0.0

service-launch auth-service.py
