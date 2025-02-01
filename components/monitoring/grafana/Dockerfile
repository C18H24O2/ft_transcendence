FROM grafana/grafana:11.5.0-ubuntu
ARG PROM_ADMIN_PASSWD

COPY grafana.ini /etc/grafana/grafana.ini
COPY sources /etc/grafana/provisioning/datasources
RUN sed -i "s/PROM_ADMIN_PASSWD/$PROM_ADMIN_PASSWD/g" /etc/grafana/provisioning/datasources/prometheus.yml
COPY dashboards /dashboards
COPY dashboard-providers /etc/grafana/provisioning/dashboards
