from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints

ItemName = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)
]


class ItemCreate(BaseModel):
    name: ItemName
    description: str | None = None


class ItemUpdate(BaseModel):
    name: ItemName | None = None
    description: str | None = None


class ItemRead(BaseModel):
    id: int
    name: str
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)
