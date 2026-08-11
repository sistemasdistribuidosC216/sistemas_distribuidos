.PHONY: help install run test lint

PYTHON = poetry run python
APP = backend/main.py

help:
	@echo "Comandos disponíveis:"
	@echo "  make install  - instala as dependências do projeto"
	@echo "  make run      - roda a aplicação"
	@echo "  make test     - roda os testes"
	@echo "  make lint     - roda o linter/formatador"

install:
	poetry install

run:
	$(PYTHON) $(APP)

test:
	poetry run pytest

lint:
	poetry run black .