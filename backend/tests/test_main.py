import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    """Fixture que fornece um client de testes para a aplicação FastAPI."""
    return TestClient(app)


def test_read_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_read_item_valid(client):
    response = client.get("/items/5")
    assert response.status_code == 200
    assert response.json() == {"item_id": 5}


def test_read_item_negative_raises_error(client):
    """Caso de erro: item_id negativo deve retornar 400."""
    response = client.get("/items/-1")
    assert response.status_code == 400
    assert response.json()["detail"] == "item_id deve ser positivo"


@pytest.mark.parametrize(
    "a, b, expected",
    [
        (1, 1, 2),
        (2, 3, 5),
        (0, 0, 0),
        (-1, 1, 0),
        (10, -5, 5),
    ],
)
def test_sum_numbers(client, a, b, expected):
    response = client.get(f"/sum?a={a}&b={b}")
    assert response.status_code == 200
    assert response.json()["result"] == expected


def test_sum_numbers_missing_param(client):
    response = client.get("/sum?a=1")
    assert response.status_code == 422
