from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.item import ItemModel


class ItemRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict) -> ItemModel:
        item = ItemModel(**data)
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def get_by_id(self, item_id: int) -> ItemModel | None:
        return self.db.get(ItemModel, item_id)

    def list(self) -> list[ItemModel]:
        return list(self.db.scalars(select(ItemModel).order_by(ItemModel.id)))

    def update(self, item: ItemModel, data: dict) -> ItemModel:
        for field, value in data.items():
            setattr(item, field, value)
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item: ItemModel) -> None:
        self.db.delete(item)
        self.db.commit()