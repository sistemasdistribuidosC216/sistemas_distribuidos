import pytest

from app.schemas.item import ItemCreate, ItemUpdate
from app.services import item_service


@pytest.fixture(autouse=True)
def reset_db():
    item_service.reset_db()
    yield
    item_service.reset_db()


def test_create_item():
    item = item_service.create_item(ItemCreate(name="Caneta", price=2.5))
    assert item.id == 1
    assert item.name == "Caneta"


def test_get_item_not_found():
    result = item_service.get_item(999)
    assert result is None


def test_update_item_partial():
    item = item_service.create_item(ItemCreate(name="Caderno", price=10.0))
    updated = item_service.update_item(item.id, ItemUpdate(price=12.0))
    assert updated.price == 12.0
    assert updated.name == "Caderno"


def test_delete_item():
    item = item_service.create_item(ItemCreate(name="Lapis", price=1.0))
    assert item_service.delete_item(item.id) is True
    assert item_service.get_item(item.id) is None
