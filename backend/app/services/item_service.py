from app.schemas.item import Item, ItemCreate, ItemUpdate

_items_db: dict[int, Item] = {}
_next_id = 1


def create_item(item: ItemCreate) -> Item:
    global _next_id
    new_item = Item(id=_next_id, **item.model_dump())
    _items_db[_next_id] = new_item
    _next_id += 1
    return new_item


def get_item(item_id: int) -> Item | None:
    return _items_db.get(item_id)


def list_items() -> list[Item]:
    return list(_items_db.values())


def replace_item(item_id: int, item: ItemCreate) -> Item | None:
    if item_id not in _items_db:
        return None
    updated = Item(id=item_id, **item.model_dump())
    _items_db[item_id] = updated
    return updated


def update_item(item_id: int, item: ItemUpdate) -> Item | None:
    existing = _items_db.get(item_id)
    if not existing:
        return None
    update_data = item.model_dump(exclude_unset=True)
    updated = existing.model_copy(update=update_data)
    _items_db[item_id] = updated
    return updated


def delete_item(item_id: int) -> bool:
    if item_id not in _items_db:
        return False
    del _items_db[item_id]
    return True


def reset_db():
    """Utilitario para limpar o banco em memoria (usado nos testes)."""
    global _next_id
    _items_db.clear()
    _next_id = 1
