.PHONY: help install run format lint test up up-build down ps restart logs migrate db-upgrade db-current e2e docker-build docker-up docker-down docker-logs docker-clean \
	frontend-install frontend-dev frontend-lint frontend-format frontend-check frontend-test frontend-test-e2e frontend-build check-all

help:
	@echo "Comandos disponíveis:"
	@echo "  make install    - instala as dependências"
	@echo "  make run        - roda a API localmente"
	@echo "  make format     - formata o código (ruff --fix + black)"
	@echo "  make lint       - verifica o código (ruff + black --check)"
	@echo "  make test       - sobe o PostgreSQL e roda os testes"
	@echo "  make up         - sobe db + api + frontend"
	@echo "  make up-build   - reconstrói as imagens e sobe db + api + frontend"
	@echo "  make down       - para os containers (mantém os dados)"
	@echo "  make ps         - mostra o estado dos containers"
	@echo "  make restart    - reinicia só a API"
	@echo "  make logs       - mostra os logs"
	@echo "  make db-upgrade - aplica as migrations"
	@echo "  make db-current - mostra a migration atual"
	@echo ""
	@echo "Frontend:"
	@echo "  make frontend-install   - instala as dependências (npm ci)"
	@echo "  make frontend-dev       - servidor de desenvolvimento (Vite)"
	@echo "  make frontend-lint      - lint com Biome"
	@echo "  make frontend-format    - formata o código com Biome"
	@echo "  make frontend-check     - lint + formatação sem alterar arquivos"
	@echo "  make frontend-test      - testes unitários e de integração (Vitest)"
	@echo "  make frontend-test-e2e  - Playwright contra uma stack já no ar"
	@echo "  make e2e                - E2E full-stack em stack isolada"
	@echo "  make frontend-build     - build de produção"
	@echo "  make check-all          - backend (Ruff + Pytest) + frontend (Biome, Vitest, build, E2E)"

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

ps:
	docker compose ps

restart:
	docker compose restart api

logs:
	docker compose logs -f

db-upgrade:
	docker compose exec -T api alembic upgrade head

db-current:
	docker compose exec -T api alembic current

migrate: db-upgrade

docker-build:
	docker compose build

docker-up: up

docker-down: down

docker-logs: logs

docker-clean:
	docker compose down -v --rmi all


# ---------- Frontend ----------

frontend-install:
	npm --prefix frontend ci

frontend-dev:
	npm --prefix frontend run dev

frontend-lint:
	npm --prefix frontend run lint

frontend-format:
	npm --prefix frontend run format

frontend-check:
	npm --prefix frontend run lint
	npm --prefix frontend run format:check

frontend-test:
	npm --prefix frontend run test

frontend-test-e2e:
	npm --prefix frontend run test:e2e

frontend-build:
	npm --prefix frontend run build

# ---------- E2E full-stack (stack separada da de desenvolvimento) ----------

E2E_COMPOSE = API_PORT=8001 FRONTEND_PORT=5174 DB_PORT=5433 \
	VITE_API_URL=http://localhost:8001 \
	CORS_ORIGINS=http://localhost:5174,http://127.0.0.1:5174 \
	docker compose -p lab-e2e

e2e:
	$(E2E_COMPOSE) up -d --build --wait && \
	$(E2E_COMPOSE) exec -T api alembic upgrade head && \
	E2E_BASE_URL=http://localhost:5174 npm --prefix frontend run test:e2e; \
	status=$$?; \
	$(E2E_COMPOSE) down -v; \
	exit $$status

check-all: lint test frontend-check frontend-test frontend-build e2e