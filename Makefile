NAME := ft_trans
COMPOSE := docker compose

up:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

.PHONY: up down
