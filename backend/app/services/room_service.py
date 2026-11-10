from app.core.errors import ConflictError, NotFoundError
from app.models import Room
from app.repositories.room_repository import RoomRepository
from app.schemas.room import RoomCreate, RoomUpdate


class RoomService:
    def __init__(self, repository: RoomRepository):
        self.repository = repository

    def _ensure_name_is_free(self, name: str, current_id: int | None = None):
        found = self.repository.get_by_name(name)
        if found is not None and found.id != current_id:
            raise ConflictError("Já existe uma sala com esse nome")

    def get_room(self, room_id: int) -> Room:
        room = self.repository.get_by_id(room_id)
        if room is None:
            raise NotFoundError("Sala não encontrada")
        return room

    def list_rooms(self, kind: str | None = None) -> list[Room]:
        return self.repository.list(kind)

    def create_room(self, data: RoomCreate) -> Room:
        self._ensure_name_is_free(data.name)
        return self.repository.create(data.model_dump())

    def replace_room(self, room_id: int, data: RoomCreate) -> Room:
        room = self.get_room(room_id)
        self._ensure_name_is_free(data.name, current_id=room_id)
        return self.repository.update(room, data.model_dump())

    def update_room(self, room_id: int, data: RoomUpdate) -> Room:
        room = self.get_room(room_id)
        changes = data.model_dump(exclude_unset=True, exclude_none=True)
        if "name" in changes:
            self._ensure_name_is_free(changes["name"], current_id=room_id)
        return self.repository.update(room, changes)

    def delete_room(self, room_id: int) -> None:
        room = self.get_room(room_id)
        if self.repository.count_reservations(room_id) > 0:
            raise ConflictError("A sala possui reservas e não pode ser excluída")
        self.repository.delete(room)
