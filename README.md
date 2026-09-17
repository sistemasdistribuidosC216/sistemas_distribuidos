# Aulas - Sistemas Distribuídos (C216)

Branch destinada às práticas desenvolvidas ao longo das aulas da disciplina C216 - Sistemas Distribuídos.

## 📋 Sobre

Cada prática é desenvolvida em uma branch própria (a partir de `aulas`) e entregue via Pull Request, seguindo o fluxo de trabalho definido pela disciplina.
# Sistemas Distribuídos

Repositório da disciplina C216 - Sistemas Distribuídos, com as práticas realizadas em aula e o projeto final.

Este repositório contém as atividades práticas desenvolvidas ao longo da disciplina, incluindo configuração de ambiente, versionamento com Git, gerenciamento de dependências e automação de tarefas, além do desenvolvimento do projeto final.

## 👤 Autor

Clara de Lima Azevedo — Engenharia de Computação, Inatel

## Como rodar os testes

### Localmente (com Poetry)

```bash
make test
```

Ou diretamente:

```bash
cd backend
poetry run pytest -v
```

### CI (GitHub Actions)

Os testes rodam automaticamente em todo push e pull request, via o workflow definido em .github/workflows/ci-backend.yml.
