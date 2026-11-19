from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import Reservation


class ReservationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict) -> Reservation:
        reservation = Reservation(**data)
        self.db.add(reservation)
        self.db.commit()
        return self.get_by_id(reservation.id)

    def get_by_id(self, reservation_id: int) -> Reservation | None:
        query = (
            select(Reservation)
            .options(joinedload(Reservation.room))
            .where(Reservation.id == reservation_id)
        )
        return self.db.scalar(query)

    def list(
        self,
        room_id: int | None = None,
        start: datetime | None = None,
        end: datetime | None = None,
    ) -> list[Reservation]:
        query = select(Reservation).options(joinedload(Reservation.room))
        if room_id is not None:
            query = query.where(Reservation.room_id == room_id)
        if start is not None and end is not None:
            query = query.where(Reservation.start_at < end, Reservation.end_at > start)
        return list(self.db.scalars(query.order_by(Reservation.start_at)))

    def find_overlapping(
        self,
        room_id: int,
        start: datetime,
        end: datetime,
        ignore_id: int | None = None,
    ) -> Reservation | None:
        query = select(Reservation).where(
            Reservation.room_id == room_id,
            Reservation.start_at < end,
            Reservation.end_at > start,
        )
        if ignore_id is not None:
            query = query.where(Reservation.id != ignore_id)
        return self.db.scalar(query.limit(1))

    def update(self, reservation: Reservation, data: dict) -> Reservation:
        for field, value in data.items():
            setattr(reservation, field, value)
        self.db.commit()
        self.db.expire(reservation, ["room"])
        return self.get_by_id(reservation.id)

    def delete(self, reservation: Reservation) -> None:
        self.db.delete(reservation)
        self.db.commit()
