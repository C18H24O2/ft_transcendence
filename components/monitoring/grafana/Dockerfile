FROM grafana/grafana:11.3.0-ubuntu

COPY grafana.ini /etc/grafana/grafana.ini
COPY sources /etc/grafana/provisioning/datasources
COPY dashboards /dashboards
COPY dashboard-providers /etc/grafana/provisioning/dashboards
