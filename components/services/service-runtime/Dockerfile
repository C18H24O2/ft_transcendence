FROM python:3.13.1-alpine3.21

WORKDIR /service-runtime

COPY . .

RUN apk add --no-cache curl poetry

# RUN pip install poetry==1.8.5

ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

WORKDIR /app

# otherwise poetry will shit itself
RUN touch README.md
