#!/usr/bin/env bash

EXAMPLE_ENV_FILE=.env.example
set -x
ln -fs $EXAMPLE_ENV_FILE .env
ln -fs ../../$EXAMPLE_ENV_FILE components/services/.env

