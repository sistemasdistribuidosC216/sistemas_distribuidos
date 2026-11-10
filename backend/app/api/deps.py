from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.room_repository import RoomRepository
from app.services.room_service import RoomService

DbSession = Annotated[Session, Depends(get_db)]


def get_room_service(db: DbSession) -> RoomService:
    return RoomService(RoomRepository(db))


RoomServiceDep = Annotated[RoomService, Depends(get_room_service)]
