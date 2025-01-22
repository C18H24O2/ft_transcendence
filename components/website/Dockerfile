#
# Note: The context of this Dockerfile is the `/components` directory.
#

# The py-builder image is where we'll use poetry to setup the virtual environment
# and install the python dependencies.
FROM python:3.13.1-alpine3.21 AS py-builder
LABEL maintainer="kiroussa <ft@xtrm.me>"

# Nice and cozy.
WORKDIR /app

# Add the runtime library to the image.
ADD services/service-runtime /service-runtime

# Install stuff
COPY website/pyproject.toml website/poetry.lock ./

# Setup poetry
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

# Install and run poetry
RUN pip install -U poetry --no-cache-dir \
	# This is required otherwise poetry *will* explode.
	&& touch README.md \
	&& poetry install --no-root \
	&& rm -rf $POETRY_CACHE_DIR

# ------------------------------------------------------------------------------

# The node-builder image is where the frontend files will be built,
# to be served by the website-service.
FROM node:22.13.1-alpine3.21 AS node-builder
LABEL maintainer="kiroussa <ft@xtrm.me>"

# we're so back.
WORKDIR /app

# Get the stuff we need
COPY website/frontend/ ./ 

# Remove the node_modules folder, just in case it hasn't been ignored.
# Get pnpm from corepack, install the dependencies, build and package everything
RUN rm -rf node_modules \
	&& corepack enable \
	&& corepack use pnpm@latest \
	&& pnpm install \
	&& pnpm run build \
	&& cp -r static/* dist/

# ------------------------------------------------------------------------------

# The service/runtime image is what will actually run the application.
FROM python:3.13.1-alpine3.21 AS runtime
LABEL maintainer="kiroussa <ft@xtrm.me>"

# yet again, we out here.
WORKDIR /app
ADD services/service-runtime /service-runtime

# We need that for healthchecks
RUN apk add --no-cache curl

# Get our venv back from the builder image.
ENV VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH"
COPY --from=py-builder ${VIRTUAL_ENV} ${VIRTUAL_ENV}

# Get the frontend files from the node-builder image.
COPY --from=node-builder /app/dist/ /app/dist/

# Get the website service files
COPY website/ .

# Expose the port
EXPOSE 42069

# Blaze it.
ENTRYPOINT ["./.venv/bin/gunicorn", "--bind", "0.0.0.0:42069", "service.wsgi:application"]
