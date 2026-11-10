from typing import Annotated

from pydantic import (
    AwareDatetime,
    BaseModel,
    ConfigDict,
    Field,
    StringConstraints,
    model_validator,
)

RequesterName = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)
]
Purpose = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)
]


class ReservationCreate(BaseModel):
    room_id: int
    requester_name: RequesterName
    purpose: Purpose
    attendees: Annotated[int, Field(gt=0)]
    start_at: AwareDatetime
    end_at: AwareDatetime

    @model_validator(mode="after")
    def check_period(self):
        if self.end_at <= self.start_at:
            raise ValueError("O horário de término deve ser depois do início")
        return self


class RoomSummary(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class ReservationRead(BaseModel):
    id: int
    room_id: int
    requester_name: str
    purpose: str
    attendees: int
    start_at: AwareDatetime
    end_at: AwareDatetime
    room: RoomSummary

    model_config = ConfigDict(from_attributes=True)
