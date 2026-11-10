from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Reservation, Room


class RoomRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict) -> Room:
        room = Room(**data)
        self.db.add(room)
        self.db.commit()
        self.db.refresh(room)
        return room

    def get_by_id(self, room_id: int) -> Room | None:
        return self.db.get(Room, room_id)

    def get_by_name(self, name: str) -> Room | None:
        return self.db.scalar(select(Room).where(Room.name == name))

    def list(self, kind: str | None = None) -> list[Room]:
        query = select(Room).order_by(Room.name)
        if kind is not None:
            query = query.where(Room.kind == kind)
        return list(self.db.scalars(query))

    def update(self, room: Room, data: dict) -> Room:
        for field, value in data.items():
            setattr(room, field, value)
        self.db.commit()
        self.db.refresh(room)
        return room

    def delete(self, room: Room) -> None:
        self.db.delete(room)
        self.db.commit()

    def count_reservations(self, room_id: int) -> int:
        query = select(func.count()).where(Reservation.room_id == room_id)
        return self.db.scalar(query)
