FROM prom/alertmanager:v0.28.0
ARG DISCORD_WEBHOOK_URL

COPY alertmanager.yml /etc/alertmanager/alertmanager.yml

RUN sed -i "s/DISCORD_WEBHOOK_URL/$(printf '%s\n' "$DISCORD_WEBHOOK_URL" | sed -e 's/pleasedontscrapethat/discord/g' | sed -e 's/[\/&]/\\&/g')/g" /etc/alertmanager/alertmanager.yml
