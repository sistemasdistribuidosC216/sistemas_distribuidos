import pytest
from fastapi.testclient import TestClient

from main import app
from app.services import item_service


@pytest.fixture(autouse=True)
def reset_db():
    item_service.reset_db()
    yield
    item_service.reset_db()


@pytest.fixture
def client():
    return TestClient(app)


def test_create_item_endpoint(client):
    response = client.post("/items/", json={"name": "Mouse", "price": 50.0})
    assert response.status_code == 201
    assert response.json()["name"] == "Mouse"


def test_list_items_endpoint(client):
    client.post("/items/", json={"name": "Teclado", "price": 100.0})
    response = client.get("/items/")
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_get_item_endpoint_not_found(client):
    response = client.get("/items/999")
    assert response.status_code == 404


def test_put_item_endpoint(client):
    created = client.post("/items/", json={"name": "Monitor", "price": 300.0}).json()
    response = client.put(f"/items/{created['id']}", json={"name": "Monitor 4K", "price": 400.0})
    assert response.status_code == 200
    assert response.json()["name"] == "Monitor 4K"


def test_patch_item_endpoint(client):
    created = client.post("/items/", json={"name": "Webcam", "price": 80.0}).json()
    response = client.patch(f"/items/{created['id']}", json={"price": 90.0})
    assert response.status_code == 200
    assert response.json()["price"] == 90.0


def test_delete_item_endpoint(client):
    created = client.post("/items/", json={"name": "Fone", "price": 60.0}).json()
    response = client.delete(f"/items/{created['id']}")
    assert response.status_code == 204
