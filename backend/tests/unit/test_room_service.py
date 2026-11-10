import pytest

from app.core.errors import ConflictError, NotFoundError
from app.models import Room
from app.schemas.room import RoomCreate, RoomUpdate
from app.services.room_service import RoomService


class FakeRoomRepository:
    def __init__(self):
        self.rooms = {}
        self.reservations = {}
        self.next_id = 1

    def create(self, data):
        room = Room(id=self.next_id, **data)
        self.rooms[room.id] = room
        self.next_id += 1
        return room

    def get_by_id(self, room_id):
        return self.rooms.get(room_id)

    def get_by_name(self, name):
        return next((r for r in self.rooms.values() if r.name == name), None)

    def list(self, kind=None):
        return [r for r in self.rooms.values() if kind in (None, r.kind)]

    def update(self, room, data):
        for field, value in data.items():
            setattr(room, field, value)
        return room

    def delete(self, room):
        del self.rooms[room.id]

    def count_reservations(self, room_id):
        return self.reservations.get(room_id, 0)


def new_room(**changes):
    data = {"name": "Lab 1", "kind": "laboratorio", "capacity": 30, "location": "A"}
    return RoomCreate(**{**data, **changes})


@pytest.fixture
def repository():
    return FakeRoomRepository()


@pytest.fixture
def service(repository):
    return RoomService(repository)


def test_create_room(service):
    room = service.create_room(new_room())
    assert room.id == 1


def test_create_room_with_duplicate_name(service):
    service.create_room(new_room())
    with pytest.raises(ConflictError):
        service.create_room(new_room())


def test_rename_room_to_existing_name(service):
    service.create_room(new_room())
    other = service.create_room(new_room(name="Sala 2"))
    with pytest.raises(ConflictError):
        service.update_room(other.id, RoomUpdate(name="Lab 1"))


def test_keep_same_name_on_update(service):
    room = service.create_room(new_room())
    updated = service.update_room(room.id, RoomUpdate(name="Lab 1", capacity=10))
    assert updated.capacity == 10


def test_get_missing_room(service):
    with pytest.raises(NotFoundError):
        service.get_room(99)


def test_delete_room_with_reservations(service, repository):
    room = service.create_room(new_room())
    repository.reservations[room.id] = 2
    with pytest.raises(ConflictError):
        service.delete_room(room.id)
    assert service.get_room(room.id) is room
