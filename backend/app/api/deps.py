from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.item_repository import ItemRepository
from app.services.item_service import ItemService


def get_item_service(db: Annotated[Session, Depends(get_db)]) -> ItemService:
    return ItemService(ItemRepository(db))


ItemServiceDep = Annotated[ItemService, Depends(get_item_service)]
