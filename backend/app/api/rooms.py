from fastapi import APIRouter

from app.api.deps import RoomServiceDep
from app.schemas.room import RoomCreate, RoomKind, RoomRead, RoomUpdate

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.get("/", response_model=list[RoomRead])
def list_rooms(service: RoomServiceDep, kind: RoomKind | None = None):
    return service.list_rooms(kind)


@router.post("/", response_model=RoomRead, status_code=201)
def create_room(data: RoomCreate, service: RoomServiceDep):
    return service.create_room(data)


@router.get("/{room_id}", response_model=RoomRead)
def get_room(room_id: int, service: RoomServiceDep):
    return service.get_room(room_id)


@router.put("/{room_id}", response_model=RoomRead)
def replace_room(room_id: int, data: RoomCreate, service: RoomServiceDep):
    return service.replace_room(room_id, data)


@router.patch("/{room_id}", response_model=RoomRead)
def update_room(room_id: int, data: RoomUpdate, service: RoomServiceDep):
    return service.update_room(room_id, data)


@router.delete("/{room_id}", status_code=204)
def delete_room(room_id: int, service: RoomServiceDep):
    service.delete_room(room_id)
