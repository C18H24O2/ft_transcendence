FROM prom/prometheus:v3.1.0
ARG PROM_ADMIN_PASSWD_HASH

COPY ./prometheus.yml /etc/prometheus/prometheus.yml
COPY ./web-config.yml /etc/prometheus/web-config.yml

RUN sed -i "s/PROM_ADMIN_PASSWD_HASH/$(printf '%s\n' "$PROM_ADMIN_PASSWD_HASH" | sed -e 's/[\/&]/\\&/g')/g" /etc/prometheus/web-config.yml
