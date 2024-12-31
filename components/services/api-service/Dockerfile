FROM ft_trans-service_runtime

WORKDIR /app

COPY pyproject.toml poetry.lock ./

RUN poetry install --no-root && rm -rf $POETRY_CACHE_DIR

COPY api ./api
COPY manage.py ./

CMD ["./.venv/bin/python", "manage.py", "runserver", "0.0.0.0:6969"]
