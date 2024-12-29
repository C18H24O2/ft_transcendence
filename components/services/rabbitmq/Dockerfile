# Because of rootless docker, we need this hacky workaround of a
# wrapping image to get files into the container volume,
# as mapped volumes don't work with the setup we have at 42.

# doc pls fix

FROM rabbitmq:4.0.5-management-alpine
LABEL maintainer="kiroussa <ft@xtrm.me>"

COPY enabled-plugins.er /etc/rabbitmq/enabled_plugins

# No need for any more directives, the entrypoint/run script will
# be inherited from the base rabbitmq image.
