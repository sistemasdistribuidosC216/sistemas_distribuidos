LAB = {"name": "Lab 1", "kind": "laboratorio", "capacity": 30, "location": "Bloco A"}


def create_room(client, **changes):
    response = client.post("/rooms/", json={**LAB, **changes})
    assert response.status_code == 201, response.text
    return response.json()


def test_create_room(client):
    room = create_room(client)
    assert room["id"] > 0
    assert room["name"] == "Lab 1"
    assert room["kind"] == "laboratorio"


def test_create_room_duplicate_name(client):
    create_room(client)
    response = client.post("/rooms/", json=LAB)
    assert response.status_code == 409
    assert response.json()["detail"] == "Já existe uma sala com esse nome"


def test_create_room_invalid_data(client):
    assert client.post("/rooms/", json={**LAB, "capacity": 0}).status_code == 422
    assert client.post("/rooms/", json={**LAB, "kind": "auditorio"}).status_code == 422
    assert client.post("/rooms/", json={**LAB, "name": "  "}).status_code == 422


def test_list_rooms_filtered_by_kind(client):
    create_room(client)
    create_room(client, name="Sala 101", kind="sala")
    response = client.get("/rooms/", params={"kind": "sala"})
    assert response.status_code == 200
    names = [room["name"] for room in response.json()]
    assert "Sala 101" in names
    assert "Lab 1" not in names


def test_get_room_not_found(client):
    response = client.get("/rooms/999999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Sala não encontrada"


def test_update_room(client):
    room = create_room(client)
    response = client.patch(f"/rooms/{room['id']}", json={"capacity": 40})
    assert response.status_code == 200
    assert response.json()["capacity"] == 40
    assert response.json()["name"] == "Lab 1"


def test_replace_room(client):
    room = create_room(client)
    data = {**LAB, "name": "Lab 2", "location": "Bloco B"}
    response = client.put(f"/rooms/{room['id']}", json=data)
    assert response.status_code == 200
    assert response.json()["location"] == "Bloco B"


def test_delete_room(client):
    room = create_room(client)
    assert client.delete(f"/rooms/{room['id']}").status_code == 204
    assert client.get(f"/rooms/{room['id']}").status_code == 404
