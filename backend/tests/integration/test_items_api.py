def test_create_item_endpoint(client):
    response = client.post("/items/", json={"name": "Mouse"})
    assert response.status_code == 201
    assert response.json()["name"] == "Mouse"
    assert response.json()["id"] > 0
    assert set(response.json()) == {"id", "name", "description"}


def test_create_item_duplicate_name(client):
    client.post("/items/", json={"name": "Mouse"})
    response = client.post("/items/", json={"name": "Mouse"})
    assert response.status_code == 409
    assert response.json()["detail"] == "Já existe um item com esse nome"


def test_create_item_invalid_name(client):
    assert client.post("/items/", json={"name": "   "}).status_code == 422
    assert client.post("/items/", json={"name": "a" * 101}).status_code == 422


def test_list_items_endpoint(client):
    client.post("/items/", json={"name": "Teclado"})
    response = client.get("/items/")
    assert response.status_code == 200
    assert response.json()[-1]["name"] == "Teclado"


def test_get_item_endpoint(client):
    created = client.post("/items/", json={"name": "Cabo"}).json()
    response = client.get(f"/items/{created['id']}")
    assert response.status_code == 200
    assert response.json()["name"] == "Cabo"


def test_get_item_endpoint_not_found(client):
    response = client.get("/items/999999")
    assert response.status_code == 404


def test_put_item_endpoint(client):
    created = client.post("/items/", json={"name": "Monitor"}).json()
    response = client.put(f"/items/{created['id']}", json={"name": "Monitor 4K"})
    assert response.status_code == 200
    assert response.json()["name"] == "Monitor 4K"


def test_patch_item_endpoint(client):
    created = client.post("/items/", json={"name": "Webcam"}).json()
    response = client.patch(f"/items/{created['id']}", json={"description": "HD"})
    assert response.status_code == 200
    assert response.json()["description"] == "HD"
    assert response.json()["name"] == "Webcam"


def test_delete_item_endpoint(client):
    created = client.post("/items/", json={"name": "Fone"}).json()
    response = client.delete(f"/items/{created['id']}")
    assert response.status_code == 204
    assert client.get(f"/items/{created['id']}").status_code == 404
