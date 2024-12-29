FROM python:3.12-bookworm AS builder

WORKDIR /service_runtime

COPY . .

RUN pip install poetry==1.8.5

ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

RUN poetry install --no-dev --no-interaction --no-ansi && poetry build

FROM python:3.12-bookworm AS runtime

WORKDIR /app

COPY --from=builder /service_runtime/dist /tmp/service_runtime

RUN pip install /tmp/service_runtime/*.whl

CMD ["python", "-m", "service_runtime.test"]
