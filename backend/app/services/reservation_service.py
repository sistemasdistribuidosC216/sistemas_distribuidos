from collections.abc import Callable
from datetime import UTC, date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from app.core.config import settings
from app.core.errors import BusinessRuleError, ConflictError, NotFoundError
from app.models import Reservation
from app.repositories.reservation_repository import ReservationRepository
from app.repositories.room_repository import RoomRepository
from app.schemas.reservation import ReservationCreate


def utc_now() -> datetime:
    return datetime.now(UTC)


class ReservationService:
    def __init__(
        self,
        repository: ReservationRepository,
        room_repository: RoomRepository,
        now: Callable[[], datetime] = utc_now,
    ):
        self.repository = repository
        self.room_repository = room_repository
        self.now = now

    def _validate(self, data: ReservationCreate, current_id: int | None = None):
        room = self.room_repository.get_by_id(data.room_id)
        if room is None:
            raise NotFoundError("Sala não encontrada")
        if data.start_at < self.now():
            raise BusinessRuleError("Não é possível reservar um horário no passado")
        if data.attendees > room.capacity:
            raise BusinessRuleError(
                f"A sala comporta no máximo {room.capacity} pessoas"
            )
        conflict = self.repository.find_overlapping(
            data.room_id, data.start_at, data.end_at, ignore_id=current_id
        )
        if conflict is not None:
            raise ConflictError("A sala já está reservada nesse horário")

    def get_reservation(self, reservation_id: int) -> Reservation:
        reservation = self.repository.get_by_id(reservation_id)
        if reservation is None:
            raise NotFoundError("Reserva não encontrada")
        return reservation

    def list_reservations(
        self, room_id: int | None = None, day: date | None = None
    ) -> list[Reservation]:
        if day is None:
            return self.repository.list(room_id)
        start = datetime.combine(day, time.min, tzinfo=ZoneInfo(settings.timezone))
        return self.repository.list(room_id, start, start + timedelta(days=1))

    def create_reservation(self, data: ReservationCreate) -> Reservation:
        self._validate(data)
        return self.repository.create(data.model_dump())

    def update_reservation(
        self, reservation_id: int, data: ReservationCreate
    ) -> Reservation:
        reservation = self.get_reservation(reservation_id)
        self._validate(data, current_id=reservation_id)
        return self.repository.update(reservation, data.model_dump())

    def delete_reservation(self, reservation_id: int) -> None:
        reservation = self.get_reservation(reservation_id)
        self.repository.delete(reservation)
