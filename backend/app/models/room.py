from sqlalchemy import CheckConstraint, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Room(Base):
    __tablename__ = "rooms"
    __table_args__ = (
        CheckConstraint("kind IN ('sala', 'laboratorio')", name="ck_rooms_kind"),
        CheckConstraint("capacity > 0", name="ck_rooms_capacity_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    kind: Mapped[str] = mapped_column(String(20))
    capacity: Mapped[int]
    location: Mapped[str] = mapped_column(String(120))

    reservations: Mapped[list["Reservation"]] = relationship(  # noqa: F821
        back_populates="room"
    )
