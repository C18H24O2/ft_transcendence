FROM grafana/grafana:11.5.1-ubuntu
ARG PROM_ADMIN_PASSWD
ARG DISCORD_WEBHOOK_URL

COPY grafana.ini /etc/grafana/grafana.ini
COPY alerting /etc/grafana/provisioning/alerting
COPY sources /etc/grafana/provisioning/datasources
COPY dashboard-providers /etc/grafana/provisioning/dashboards

RUN sed -i "s/DISCORD_WEBHOOK_URL/$(printf '%s' "$DISCORD_WEBHOOK_URL" | sed -e 's/pleasedontscrapethat/discord/g' | sed -e 's/[\/&]/\\&/g')/g" /etc/grafana/provisioning/alerting/discord.yml
RUN sed -i "s/PROM_ADMIN_PASSWD/$PROM_ADMIN_PASSWD/g" /etc/grafana/provisioning/datasources/prometheus.yml

COPY dashboards /dashboards
