.PHONY: help install up up-build down ps logs db-upgrade db-current \
	lint format test frontend-check frontend-format frontend-test frontend-build \
	e2e check-all clean

help:
	@echo "Comandos disponiveis:"
	@echo "  make install          - instala as dependencias do backend e do frontend"
	@echo "  make up               - sobe db, api e frontend"
	@echo "  make up-build         - reconstroi as imagens e sobe tudo"
	@echo "  make down             - para os containers (mantem os dados)"
	@echo "  make ps               - mostra o estado dos containers"
	@echo "  make logs             - acompanha os logs"
	@echo "  make db-upgrade       - aplica as migrations no container da API"
	@echo "  make db-current       - mostra a migration atual"
	@echo "  make lint / format    - Ruff + Black no backend"
	@echo "  make test             - testes do backend (Pytest) em um banco separado"
	@echo "  make frontend-check   - Biome (lint + formatacao)"
	@echo "  make frontend-test    - testes do frontend (Vitest)"
	@echo "  make frontend-build   - build de producao do frontend"
	@echo "  make e2e              - E2E com Playwright em uma stack isolada"
	@echo "  make check-all        - roda todas as verificacoes"
	@echo "  make clean            - remove containers, volumes e imagens do projeto"

install:
	cd backend && poetry install
	npm --prefix frontend ci

up:
	docker compose up -d --wait

up-build:
	docker compose up -d --build --wait

down:
	docker compose down

ps:
	docker compose ps

logs:
	docker compose logs -f

db-upgrade:
	docker compose exec -T api alembic upgrade head

db-current:
	docker compose exec -T api alembic current

# ---------- Backend ----------

lint:
	cd backend && poetry run ruff check . && poetry run black --check .

format:
	cd backend && poetry run ruff check --fix . && poetry run black .

TEST_DATABASE_URL ?= postgresql+psycopg://reservas:reservas@localhost:5432/reservas_test

test:
	docker compose up -d --wait db
	docker compose exec -T db sh -c 'createdb -U "$$POSTGRES_USER" reservas_test 2>/dev/null || true'
	cd backend && DATABASE_URL=$(TEST_DATABASE_URL) poetry run pytest -v

# ---------- Frontend ----------

frontend-check:
	npm --prefix frontend run lint
	npm --prefix frontend run format:check

frontend-format:
	npm --prefix frontend run format

frontend-test:
	npm --prefix frontend run test

frontend-build:
	npm --prefix frontend run build

# ---------- E2E (stack separada da de desenvolvimento) ----------

E2E_COMPOSE = API_PORT=8001 FRONTEND_PORT=5174 DB_PORT=5433 \
	VITE_API_URL=http://localhost:8001 \
	CORS_ORIGINS=http://localhost:5174 \
	docker compose -p reservas-e2e

e2e:
	$(E2E_COMPOSE) up -d --build --wait && \
	$(E2E_COMPOSE) exec -T api alembic upgrade head && \
	E2E_BASE_URL=http://localhost:5174 npm --prefix frontend run test:e2e; \
	status=$$?; \
	$(E2E_COMPOSE) down -v; \
	exit $$status

check-all: lint test frontend-check frontend-test frontend-build e2e

clean:
	docker compose down -v --rmi local