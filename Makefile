NAME := ft_trans
COMPOSE := docker compose
DETACH ?= 1

up:
ifeq ($(DETACH), 1)
	$(COMPOSE) up --build -d
else
	$(COMPOSE) up --build || true
endif

down:
	$(COMPOSE) down

clean:
	$(COMPOSE) down --volumes

re: down up

dev:
	pnpm run --prefix components/website/frontend dev

ensure-frontend-not-fucked:
	pnpm run --prefix components/website/frontend build

.PHONY: up down re dev
