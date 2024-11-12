NAME := ft_trans
COMPOSE := docker compose

up:
	$(COMPOSE) up --build || true

down:
	$(COMPOSE) down -v

re: down up

dev:
	pnpm run --prefix components/website/frontend dev

.PHONY: up down re dev
