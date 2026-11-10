from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

RoomName = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)
]
RoomLocation = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)
]
RoomKind = Literal["sala", "laboratorio"]
Capacity = Annotated[int, Field(gt=0, le=500)]


class RoomCreate(BaseModel):
    name: RoomName
    kind: RoomKind
    capacity: Capacity
    location: RoomLocation


class RoomUpdate(BaseModel):
    name: RoomName | None = None
    kind: RoomKind | None = None
    capacity: Capacity | None = None
    location: RoomLocation | None = None


class RoomRead(BaseModel):
    id: int
    name: str
    kind: RoomKind
    capacity: int
    location: str

    model_config = ConfigDict(from_attributes=True)
