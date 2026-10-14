.PHONY: help install run format lint test up up-build down restart logs migrate docker-build docker-up docker-down docker-logs docker-clean

help:
	@echo "Comandos disponíveis:"
	@echo "  make install    - instala as dependências"
	@echo "  make run        - roda a API localmente"
	@echo "  make format     - formata o código (ruff --fix + black)"
	@echo "  make lint       - verifica o código (ruff + black --check)"
	@echo "  make test       - sobe o PostgreSQL e roda os testes"
	@echo "  make up         - sobe API + PostgreSQL"
	@echo "  make up-build   - reconstrói as imagens e sobe API + PostgreSQL"
	@echo "  make down       - para os containers (mantém os dados)"
	@echo "  make restart    - reinicia só a API"
	@echo "  make logs       - mostra os logs"
	@echo "  make migrate    - aplica as migrations"

install:
	cd backend && poetry install

run:
	cd backend && poetry run uvicorn main:app --reload

format:
	cd backend && poetry run ruff check --fix . && poetry run black .

lint:
	cd backend && poetry run ruff check . && poetry run black --check .

test:
	docker compose up -d --wait db
	cd backend && poetry run pytest -v

up:
	docker compose up -d

up-build:
	docker compose up -d --build

down:
	docker compose down

restart:
	docker compose restart backend

logs:
	docker compose logs -f

migrate:
	docker compose exec backend alembic upgrade head

docker-build:
	docker compose build

docker-up: up

docker-down: down

docker-logs: logs

docker-clean:
	docker compose down -v --rmi all