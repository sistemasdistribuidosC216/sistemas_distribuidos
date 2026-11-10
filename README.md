# Reserva de Salas e Laboratórios

Projeto Final da disciplina **C216 — Sistemas Distribuídos**


## Objetivo

Instituições de ensino costumam controlar o uso de salas e laboratórios por planilhas ou mensagens, o que gera reservas duplicadas, turmas maiores que a capacidade da sala e falta de visibilidade sobre a agenda.

Esta aplicação web centraliza o cadastro de salas e laboratórios e o agendamento de reservas, aplicando as regras automaticamente: **não permite dois agendamentos no mesmo horário para a mesma sala**, nem reservas acima da capacidade ou no passado.

## Funcionalidades

**Salas e laboratórios**
- Cadastrar, listar, editar e excluir salas (nome, tipo, capacidade e localização)
- Filtrar a listagem por tipo (sala de aula ou laboratório)
- Exclusão com confirmação

**Reservas**
- Cadastrar, listar, editar e cancelar reservas (sala, responsável, finalidade, participantes, data e horário)
- Filtrar reservas por sala e por dia
- Exibição de data e horário no fuso de Brasília

**Interface**
- Estados de carregamento, sucesso e erro em todas as telas
- Validação imediata no formulário, com as mensagens de erro da API exibidas ao usuário
- Em caso de erro, o formulário mantém o que foi digitado

## Regras de negócio

| Regra | Onde é garantida | Resposta da API |
| --- | --- | --- |
| Nome de sala único | Service + restrição `UNIQUE` no banco | `409 Conflict` |
| Capacidade entre 1 e 500 | Schema (Pydantic) + `CHECK` no banco | `422` |
| Sala com reservas não pode ser excluída | Service + `ON DELETE RESTRICT` | `409 Conflict` |
| Término depois do início | Schema + `CHECK` no banco | `422` |
| Reserva não pode começar no passado | Service | `422` |
| Participantes não podem exceder a capacidade | Service | `422` |
| Sem sobreposição de horário na mesma sala | Service | `409 Conflict` |
| Sala inexistente | Service | `404 Not Found` |

Duas reservas se sobrepõem quando uma começa antes da outra terminar **e** termina depois da outra começar. Reservas "encostadas" (uma termina às 12:00 e a outra começa às 12:00) são permitidas.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Backend | Python 3.12, FastAPI, Pydantic, SQLAlchemy 2, Alembic, Poetry |
| Banco de dados | PostgreSQL 16 |
| Frontend | React, Vite, Tailwind CSS |
| Qualidade | Ruff, Black, Biome |
| Testes | Pytest, Vitest, Testing Library, Playwright |
| Infraestrutura | Docker, Docker Compose, Makefile, GitHub Actions |

## Arquitetura

```text
Navegador (React)  :5173
      │  HTTP/JSON (fetch) — origens diferentes, liberadas por CORS
      ▼
API FastAPI        :8000
      │  rotas → services (regras) → repositories (SQL)
      ▼
PostgreSQL         :5432   (host "db" dentro da rede do Docker)
```

O backend segue a separação em camadas:

- **routes** (`app/api`): recebem a requisição HTTP e devolvem a resposta;
- **services**: aplicam as regras de negócio e lançam erros de domínio (`NotFoundError`, `ConflictError`, `BusinessRuleError`), convertidos em HTTP por um único tratador;
- **repositories**: concentram o acesso ao banco com SQLAlchemy;
- **schemas**: validam a entrada e definem a saída (Pydantic);
- **models**: mapeiam as tabelas.

## Estrutura

```text
.
├── backend/
│   ├── alembic/              # migrations versionadas
│   ├── app/
│   │   ├── api/              # rotas (rooms, reservations) e dependências
│   │   ├── core/             # configurações e erros de domínio
│   │   ├── db/               # engine e sessão do SQLAlchemy
│   │   ├── models/           # Room e Reservation
│   │   ├── repositories/     # acesso ao banco
│   │   ├── schemas/          # validação de entrada e saída
│   │   ├── services/         # regras de negócio
│   │   └── main.py           # app FastAPI, CORS e tratador de erros
│   ├── tests/                # unit/ (sem banco) e integration/ (com PostgreSQL)
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # formulários e listas
│   │   ├── pages/            # telas de salas e de reservas
│   │   ├── services/         # cliente HTTP (fetch)
│   │   ├── dates.js          # conversão de datas e horários
│   │   └── validation.js     # validação dos formulários
│   ├── tests/                # unit/, integration/ (Vitest) e e2e/ (Playwright)
│   └── Dockerfile
├── .github/workflows/        # CI do backend e do frontend
├── docker-compose.yml        # serviços db, api e frontend
├── Makefile
└── .env.example
```

## Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/health` | Verificação de saúde (usada no healthcheck) |
| GET | `/rooms/?kind=` | Lista salas, com filtro opcional por tipo |
| POST | `/rooms/` | Cadastra uma sala |
| GET | `/rooms/{id}` | Consulta uma sala |
| PUT / PATCH | `/rooms/{id}` | Atualiza uma sala (completa / parcial) |
| DELETE | `/rooms/{id}` | Exclui uma sala sem reservas |
| GET | `/reservations/?room_id=&day=` | Lista reservas, com filtros por sala e dia |
| POST | `/reservations/` | Cadastra uma reserva |
| GET | `/reservations/{id}` | Consulta uma reserva |
| PUT | `/reservations/{id}` | Atualiza uma reserva |
| DELETE | `/reservations/{id}` | Cancela uma reserva |

A documentação interativa fica em `http://localhost:8000/docs` (Swagger).

## Pré-requisitos

- Docker e Docker Compose
- Make
- Para rodar testes e lint fora dos contêineres: Python 3.12 com Poetry e Node.js 22

## Variáveis de ambiente

As configurações ficam no arquivo `.env` (não versionado). Copie o modelo:

```bash
cp .env.example .env
```

| Variável | Padrão | Uso |
| --- | --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | `reservas` | Credenciais do banco de desenvolvimento |
| `DB_PORT` | `5432` | Porta do PostgreSQL no computador |
| `API_PORT` | `8000` | Porta da API no computador |
| `FRONTEND_PORT` | `5173` | Porta do frontend no computador |
| `VITE_API_URL` | `http://localhost:8000` | Endereço que o **navegador** usa para chamar a API |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Origens que a API aceita, separadas por vírgula |

Os valores do `.env.example` são apenas para desenvolvimento. Nenhum segredo real é versionado.

## Como executar

```bash
cp .env.example .env
make up-build      # constrói as imagens e sobe db, api e frontend
make ps            # os três serviços devem aparecer como healthy
```

- Aplicação: http://localhost:5173
- API (Swagger): http://localhost:8000/docs

As migrations são aplicadas automaticamente quando a API sobe. Para parar: `make down` (os dados são mantidos no volume `pgdata`).

### No GitHub Codespaces

No Codespaces, o navegador acessa as portas por URLs públicas do GitHub. Ajuste o `.env` antes de subir:

```bash
cp .env.example .env
FRONT="https://${CODESPACE_NAME}-5173.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
API="https://${CODESPACE_NAME}-8000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
sed -i "s|^VITE_API_URL=.*|VITE_API_URL=$API|" .env
sed -i "s|^CORS_ORIGINS=.*|CORS_ORIGINS=$FRONT,http://localhost:5173|" .env
make up-build
gh codespace ports visibility 8000:public -c "$CODESPACE_NAME"
echo "$FRONT"
```

A porta 8000 precisa ser pública porque o navegador chama a API diretamente. Ao terminar, rode `gh codespace ports visibility 8000:private -c "$CODESPACE_NAME"`.

## Migrações

```bash
make db-upgrade    # aplica as migrations no contêiner da API
make db-current    # mostra a revisão atual
```

Para criar uma nova migration depois de alterar um model:

```bash
cd backend
poetry run alembic revision --autogenerate -m "descricao da mudanca"
```

## Testes e qualidade

| Comando | O que faz |
| --- | --- |
| `make install` | Instala as dependências do backend e do frontend |
| `make lint` / `make format` | Ruff e Black no backend |
| `make test` | Pytest (unitários e integração) em um banco separado (`reservas_test`) |
| `make frontend-check` | Biome (lint e formatação) |
| `make frontend-test` | Vitest (unitários e integração com `fetch` simulado) |
| `make frontend-build` | Build de produção do frontend |
| `make e2e` | Playwright em uma stack isolada (`reservas-e2e`, portas 8001/5174/5433), removida ao final |
| `make check-all` | Executa todas as verificações acima |

Antes do primeiro `make e2e`, instale o navegador do Playwright:

```bash
cd frontend && npx playwright install --with-deps chromium
```

Níveis de teste:

- **Backend:** testes unitários dos services com repositórios falsos, e testes de integração da API com PostgreSQL real, em transações desfeitas ao fim de cada teste.
- **Frontend:** testes unitários de validação, cliente HTTP e componentes, e testes de integração das telas com a API simulada.
- **E2E:** navegador real → React → FastAPI → PostgreSQL. Cadastra sala e reserva, recarrega a página para provar a persistência e verifica o bloqueio de conflito de horário.

## Integração contínua

Os workflows em `.github/workflows/` rodam a cada push e pull request:

- **CI - Backend:** Ruff, Black, migrations e Pytest com um PostgreSQL de serviço;
- **CI - Frontend:** Biome, Vitest, build e E2E com a stack completa via Docker Compose.

**Vídeo de demonstração:**

## Autoria

Clara de Lima Azevedo — Engenharia de Computação, Inatel