FROM node:22.4.0-alpine3.19

COPY . /app

WORKDIR /app

RUN corepack enable pnpm
RUN corepack use pnpm@latest

RUN pnpm install

COPY builder.sh .
RUN chmod +x builder.sh

ENTRYPOINT ["./builder.sh"]

CMD ["pnpm", "run", "build"]
