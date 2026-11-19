from datetime import UTC, datetime, timedelta

TOMORROW = (datetime.now(UTC) + timedelta(days=1)).replace(
    hour=13, minute=0, second=0, microsecond=0
)


def period(start_hour_offset=0, hours=2):
    start = TOMORROW + timedelta(hours=start_hour_offset)
    return start.isoformat(), (start + timedelta(hours=hours)).isoformat()


def create_room(client, name="Lab 1", capacity=20):
    data = {"name": name, "kind": "laboratorio", "capacity": capacity, "location": "A"}
    response = client.post("/rooms/", json=data)
    assert response.status_code == 201, response.text
    return response.json()


def reservation_data(room_id, **changes):
    start_at, end_at = period()
    data = {
        "room_id": room_id,
        "requester_name": "Maria",
        "purpose": "Aula de Redes",
        "attendees": 10,
        "start_at": start_at,
        "end_at": end_at,
    }
    return {**data, **changes}


def test_create_reservation(client):
    room = create_room(client)
    response = client.post("/reservations/", json=reservation_data(room["id"]))
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["room"] == {"id": room["id"], "name": "Lab 1"}
    assert body["attendees"] == 10


def test_reservation_end_before_start(client):
    room = create_room(client)
    start_at, end_at = period()
    data = reservation_data(room["id"], start_at=end_at, end_at=start_at)
    assert client.post("/reservations/", json=data).status_code == 422


def test_reservation_in_the_past(client):
    room = create_room(client)
    yesterday = datetime.now(UTC) - timedelta(days=1)
    data = reservation_data(
        room["id"],
        start_at=yesterday.isoformat(),
        end_at=(yesterday + timedelta(hours=1)).isoformat(),
    )
    response = client.post("/reservations/", json=data)
    assert response.status_code == 422
    assert response.json()["detail"] == "Não é possível reservar um horário no passado"


def test_reservation_above_capacity(client):
    room = create_room(client, capacity=5)
    response = client.post(
        "/reservations/", json=reservation_data(room["id"], attendees=6)
    )
    assert response.status_code == 422
    assert response.json()["detail"] == "A sala comporta no máximo 5 pessoas"


def test_reservation_for_missing_room(client):
    response = client.post("/reservations/", json=reservation_data(999999))
    assert response.status_code == 404


def test_overlapping_reservation(client):
    room = create_room(client)
    client.post("/reservations/", json=reservation_data(room["id"]))
    start_at, end_at = period(start_hour_offset=1)
    data = reservation_data(room["id"], start_at=start_at, end_at=end_at)
    response = client.post("/reservations/", json=data)
    assert response.status_code == 409
    assert response.json()["detail"] == "A sala já está reservada nesse horário"


def test_back_to_back_reservations_are_allowed(client):
    room = create_room(client)
    client.post("/reservations/", json=reservation_data(room["id"]))
    start_at, end_at = period(start_hour_offset=2)
    data = reservation_data(room["id"], start_at=start_at, end_at=end_at)
    assert client.post("/reservations/", json=data).status_code == 201


def test_same_time_in_other_room_is_allowed(client):
    room = create_room(client)
    other = create_room(client, name="Lab 2")
    client.post("/reservations/", json=reservation_data(room["id"]))
    response = client.post("/reservations/", json=reservation_data(other["id"]))
    assert response.status_code == 201


def test_list_reservations_by_room_and_day(client):
    room = create_room(client)
    other = create_room(client, name="Lab 2")
    client.post("/reservations/", json=reservation_data(room["id"]))
    client.post("/reservations/", json=reservation_data(other["id"]))
    params = {"room_id": room["id"], "day": TOMORROW.date().isoformat()}
    response = client.get("/reservations/", params=params)
    assert response.status_code == 200
    assert [r["room_id"] for r in response.json()] == [room["id"]]


def test_update_reservation_keeps_own_slot(client):
    room = create_room(client)
    created = client.post("/reservations/", json=reservation_data(room["id"])).json()
    data = reservation_data(room["id"], purpose="Prova")
    response = client.put(f"/reservations/{created['id']}", json=data)
    assert response.status_code == 200
    assert response.json()["purpose"] == "Prova"


def test_delete_reservation_and_then_room(client):
    room = create_room(client)
    created = client.post("/reservations/", json=reservation_data(room["id"])).json()
    assert client.delete(f"/rooms/{room['id']}").status_code == 409
    assert client.delete(f"/reservations/{created['id']}").status_code == 204
    assert client.delete(f"/rooms/{room['id']}").status_code == 204
