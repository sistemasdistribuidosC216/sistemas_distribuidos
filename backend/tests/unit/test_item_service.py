import pytest

from app.models.item import ItemModel
from app.schemas.item import ItemCreate, ItemUpdate
from app.services.item_service import DuplicateItemNameError, ItemService


class FakeItemRepository:
    def __init__(self):
        self.items = {}
        self.next_id = 1

    def create(self, data):
        item = ItemModel(id=self.next_id, **data)
        self.items[item.id] = item
        self.next_id += 1
        return item

    def get_by_id(self, item_id):
        return self.items.get(item_id)

    def get_by_name(self, name):
        return next((i for i in self.items.values() if i.name == name), None)

    def list(self):
        return list(self.items.values())

    def update(self, item, data):
        for field, value in data.items():
            setattr(item, field, value)
        return item

    def delete(self, item):
        del self.items[item.id]


@pytest.fixture
def service():
    return ItemService(FakeItemRepository())


def test_create_item(service):
    item = service.create_item(ItemCreate(name="Caneta"))
    assert item.id == 1
    assert item.name == "Caneta"


def test_create_item_duplicate_name(service):
    service.create_item(ItemCreate(name="Caneta"))
    with pytest.raises(DuplicateItemNameError):
        service.create_item(ItemCreate(name="Caneta"))


def test_get_item_not_found(service):
    assert service.get_item(999) is None


def test_update_item_partial(service):
    item = service.create_item(ItemCreate(name="Caderno"))
    updated = service.update_item(item.id, ItemUpdate(description="Capa dura"))
    assert updated.description == "Capa dura"
    assert updated.name == "Caderno"


def test_update_item_not_found(service):
    assert service.update_item(999, ItemUpdate(description="x")) is None


def test_delete_item(service):
    item = service.create_item(ItemCreate(name="Lapis"))
    assert service.delete_item(item.id) is True
    assert service.get_item(item.id) is None


def test_delete_item_not_found(service):
    assert service.delete_item(999) is False
