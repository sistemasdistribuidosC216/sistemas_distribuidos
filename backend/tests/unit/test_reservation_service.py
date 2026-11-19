from datetime import UTC, datetime, timedelta

import pytest

from app.core.errors import BusinessRuleError, ConflictError, NotFoundError
from app.models import Reservation, Room
from app.schemas.reservation import ReservationCreate
from app.services.reservation_service import ReservationService

NOW = datetime(2026, 11, 10, 12, 0, tzinfo=UTC)


class FakeRoomRepository:
    def __init__(self, rooms):
        self.rooms = {room.id: room for room in rooms}

    def get_by_id(self, room_id):
        return self.rooms.get(room_id)


class FakeReservationRepository:
    def __init__(self):
        self.reservations = {}
        self.next_id = 1

    def create(self, data):
        reservation = Reservation(id=self.next_id, **data)
        self.reservations[reservation.id] = reservation
        self.next_id += 1
        return reservation

    def get_by_id(self, reservation_id):
        return self.reservations.get(reservation_id)

    def find_overlapping(self, room_id, start, end, ignore_id=None):
        for reservation in self.reservations.values():
            if (
                reservation.room_id == room_id
                and reservation.id != ignore_id
                and reservation.start_at < end
                and reservation.end_at > start
            ):
                return reservation
        return None

    def update(self, reservation, data):
        for field, value in data.items():
            setattr(reservation, field, value)
        return reservation


def booking(start_hours=24, hours=2, **changes):
    start = NOW + timedelta(hours=start_hours)
    data = {
        "room_id": 1,
        "requester_name": "Maria",
        "purpose": "Aula",
        "attendees": 10,
        "start_at": start,
        "end_at": start + timedelta(hours=hours),
    }
    return ReservationCreate(**{**data, **changes})


@pytest.fixture
def service():
    room = Room(id=1, name="Lab 1", kind="laboratorio", capacity=20, location="A")
    return ReservationService(
        FakeReservationRepository(), FakeRoomRepository([room]), now=lambda: NOW
    )


def test_create_reservation(service):
    reservation = service.create_reservation(booking())
    assert reservation.id == 1


def test_end_must_be_after_start():
    with pytest.raises(ValueError):
        booking(hours=0)


def test_cannot_book_in_the_past(service):
    with pytest.raises(BusinessRuleError):
        service.create_reservation(booking(start_hours=-1))


def test_cannot_exceed_capacity(service):
    with pytest.raises(BusinessRuleError):
        service.create_reservation(booking(attendees=21))


def test_room_must_exist(service):
    with pytest.raises(NotFoundError):
        service.create_reservation(booking(room_id=99))


def test_overlap_is_a_conflict(service):
    service.create_reservation(booking())
    with pytest.raises(ConflictError):
        service.create_reservation(booking(start_hours=25))


def test_back_to_back_is_allowed(service):
    service.create_reservation(booking())
    assert service.create_reservation(booking(start_hours=26)).id == 2


def test_update_does_not_conflict_with_itself(service):
    reservation = service.create_reservation(booking())
    updated = service.update_reservation(reservation.id, booking(purpose="Prova"))
    assert updated.purpose == "Prova"
