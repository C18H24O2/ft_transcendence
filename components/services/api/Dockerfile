FROM python:3.12-bookworm AS builder

ENV SERVICE_NAME=auth-service

RUN pip install poetry==1.4.2

ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

WORKDIR /app

COPY api/pyproject.toml api/poetry.lock ./
RUN touch README.md

RUN poetry install --without dev --no-root && rm -rf $POETRY_CACHE_DIR

FROM python:3.12-slim AS runtime

RUN apt update
RUN apt install -y wget

ENV VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

COPY --from=builder ${VIRTUAL_ENV} ${VIRTUAL_ENV}

COPY service-runtime/service_runtime ./service_runtime
COPY api/api/ ./api/
COPY api/manage.py ./

CMD ["python", "manage.py", "runserver", "0.0.0.0:6969"]
