NAME := ft_trans
COMPOSE := docker compose

up:
	$(COMPOSE) up --build || true

down:
	$(COMPOSE) down -v

.PHONY: up down
