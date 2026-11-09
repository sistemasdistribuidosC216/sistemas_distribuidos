from fastapi import APIRouter, HTTPException

from app.api.deps import ItemServiceDep
from app.schemas.item import ItemCreate, ItemRead, ItemUpdate
from app.services.item_service import DuplicateItemNameError

router = APIRouter(prefix="/items", tags=["items"])

DUPLICATE_NAME_MESSAGE = "Já existe um item com esse nome"


@router.post("/", response_model=ItemRead, status_code=201)
def create_item(item: ItemCreate, service: ItemServiceDep):
    try:
        return service.create_item(item)
    except DuplicateItemNameError as error:
        raise HTTPException(status_code=409, detail=DUPLICATE_NAME_MESSAGE) from error


@router.get("/", response_model=list[ItemRead])
def list_items(service: ItemServiceDep):
    return service.list_items()


@router.get("/{item_id}", response_model=ItemRead)
def get_item(item_id: int, service: ItemServiceDep):
    item = service.get_item(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item nao encontrado")
    return item


@router.put("/{item_id}", response_model=ItemRead)
def replace_item(item_id: int, item: ItemCreate, service: ItemServiceDep):
    try:
        updated = service.replace_item(item_id, item)
    except DuplicateItemNameError as error:
        raise HTTPException(status_code=409, detail=DUPLICATE_NAME_MESSAGE) from error
    if updated is None:
        raise HTTPException(status_code=404, detail="Item nao encontrado")
    return updated


@router.patch("/{item_id}", response_model=ItemRead)
def update_item(item_id: int, item: ItemUpdate, service: ItemServiceDep):
    try:
        updated = service.update_item(item_id, item)
    except DuplicateItemNameError as error:
        raise HTTPException(status_code=409, detail=DUPLICATE_NAME_MESSAGE) from error
    if updated is None:
        raise HTTPException(status_code=404, detail="Item nao encontrado")
    return updated


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int, service: ItemServiceDep):
    deleted = service.delete_item(item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Item nao encontrado")
