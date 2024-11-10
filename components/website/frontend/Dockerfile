FROM node:22.4.0-alpine3.19

COPY . /app

WORKDIR /app

RUN corepack enable pnpm
RUN corepack use pnpm@latest

RUN pnpm install

CMD ["pnpm", "run", "build"]
