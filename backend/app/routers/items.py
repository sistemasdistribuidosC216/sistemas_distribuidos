from fastapi import APIRouter, HTTPException

from app.schemas.item import Item, ItemCreate, ItemUpdate
from app.services import item_service

router = APIRouter(prefix="/items", tags=["items"])


@router.post("/", response_model=Item, status_code=201)
def create_item(item: ItemCreate):
    return item_service.create_item(item)


@router.get("/", response_model=list[Item])
def list_items():
    return item_service.list_items()


@router.get("/{item_id}", response_model=Item)
def get_item(item_id: int):
    item = item_service.get_item(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item nao encontrado")
    return item


@router.put("/{item_id}", response_model=Item)
def replace_item(item_id: int, item: ItemCreate):
    updated = item_service.replace_item(item_id, item)
    if updated is None:
        raise HTTPException(status_code=404, detail="Item nao encontrado")
    return updated


@router.patch("/{item_id}", response_model=Item)
def update_item(item_id: int, item: ItemUpdate):
    updated = item_service.update_item(item_id, item)
    if updated is None:
        raise HTTPException(status_code=404, detail="Item nao encontrado")
    return updated


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int):
    deleted = item_service.delete_item(item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Item nao encontrado")
