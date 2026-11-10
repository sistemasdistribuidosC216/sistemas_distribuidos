from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Reservation(Base):
    __tablename__ = "reservations"
    __table_args__ = (
        CheckConstraint("end_at > start_at", name="ck_reservations_period"),
        CheckConstraint("attendees > 0", name="ck_reservations_attendees_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    room_id: Mapped[int] = mapped_column(
        ForeignKey("rooms.id", ondelete="RESTRICT"), index=True
    )
    requester_name: Mapped[str] = mapped_column(String(120))
    purpose: Mapped[str] = mapped_column(String(200))
    attendees: Mapped[int]
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    room: Mapped["Room"] = relationship(back_populates="reservations")  # noqa: F821
