from app.repositories.item_repository import ItemRepository
from app.schemas.item import ItemCreate, ItemUpdate


class ItemService:
    def __init__(self, repository: ItemRepository):
        self.repository = repository

    def create_item(self, item: ItemCreate):
        return self.repository.create(item.model_dump())

    def get_item(self, item_id: int):
        return self.repository.get_by_id(item_id)

    def list_items(self):
        return self.repository.list()

    def replace_item(self, item_id: int, item: ItemCreate):
        existing = self.repository.get_by_id(item_id)
        if existing is None:
            return None
        return self.repository.update(existing, item.model_dump())

    def update_item(self, item_id: int, item: ItemUpdate):
        existing = self.repository.get_by_id(item_id)
        if existing is None:
            return None
        return self.repository.update(existing, item.model_dump(exclude_unset=True))

    def delete_item(self, item_id: int) -> bool:
        existing = self.repository.get_by_id(item_id)
        if existing is None:
            return False
        self.repository.delete(existing)
        return True