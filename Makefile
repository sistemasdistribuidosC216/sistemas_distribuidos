.PHONY: help install run test lint docker-build docker-up docker-down docker-logs docker-clean

PYTHON = poetry run python
APP = backend/main.py

help:
	@echo "Comandos disponíveis:"
	@echo "  make install      - instala as dependências do projeto"
	@echo "  make run          - roda a aplicação"
	@echo "  make test         - roda os testes"
	@echo "  make lint         - roda o linter/formatador"
	@echo "  make docker-build - constrói as imagens Docker"
	@echo "  make docker-up    - sobe os containers em background"
	@echo "  make docker-down  - para e remove os containers"
	@echo "  make docker-logs  - mostra os logs dos containers em tempo real"
	@echo "  make docker-clean - remove containers, volumes e imagens"

install:
	poetry install

run:
	$(PYTHON) $(APP)

test:
	poetry run pytest

lint:
	poetry run black .

docker-build:
	docker compose build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

docker-clean:
	docker compose down -v --rmi all
