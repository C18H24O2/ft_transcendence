FROM python:3.12-bookworm AS builder

ENV SERVICE_NAME=auth-service

RUN pip install poetry==1.8.5

ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

WORKDIR /app

COPY api/pyproject.toml api/poetry.lock ./
RUN touch README.md

RUN poetry install --without dev --no-root && rm -rf $POETRY_CACHE_DIR

FROM xtrmdev:ft_trans-service:0.0.1 AS runtime

RUN apt update -y && apt install -y wget

ENV VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

COPY --from=builder ${VIRTUAL_ENV} ${VIRTUAL_ENV}

RUN pip install /tmp/service_runtime/*.whl

COPY . .

CMD ["python", "manage.py", "runserver", "0.0.0.0:6969"]
