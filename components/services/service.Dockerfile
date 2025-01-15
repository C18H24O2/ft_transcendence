# The builder image is where we'll use poetry to setup the virtual environment
# and install the dependencies.
FROM python:3.13.1-alpine3.21 AS builder
LABEL maintainer="kiroussa <ft@xtrm.me>"
ARG app_path

# Nice and cozy.
WORKDIR /app

# Add the runtime library to the image.
ADD service-runtime /service-runtime

# Install stuff.
COPY $app_path/pyproject.toml $app_path/poetry.lock ./

# Setup poetry.
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

# Install and run poetry.
RUN pip install -U poetry --no-cache-dir \
	# This is required otherwise poetry *will* explode.
	&& touch README.md \
	&& poetry install --no-root \
	&& rm -rf $POETRY_CACHE_DIR

# ------------------------------------------------------------------------------

# The service/runtime image is what will actually run the application.
FROM python:3.13.1-alpine3.21 AS service
LABEL maintainer="kiroussa <ft@xtrm.me>"
ARG app_path

# We're so back, but different.
WORKDIR /app
ADD service-runtime /service-runtime

# We need that for healthchecks.
RUN apk add --no-cache curl

# Get our venv back from the builder image.
ENV VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH"
COPY --from=builder ${VIRTUAL_ENV} ${VIRTUAL_ENV}

# COPY, if given a directory, will copy the **contents** of the directory to the
# destination..... what.
# here i was fiddling around with my poor globstar and crying at 6:47am
COPY $app_path/ ./

EXPOSE 42069

ENTRYPOINT ["/app/.venv/bin/gunicorn", "--bind", "0.0.0.0:42069"]
