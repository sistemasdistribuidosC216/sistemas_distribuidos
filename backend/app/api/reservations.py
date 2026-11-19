from datetime import date

from fastapi import APIRouter

from app.api.deps import ReservationServiceDep
from app.schemas.reservation import ReservationCreate, ReservationRead

router = APIRouter(prefix="/reservations", tags=["reservations"])


@router.get("/", response_model=list[ReservationRead])
def list_reservations(
    service: ReservationServiceDep,
    room_id: int | None = None,
    day: date | None = None,
):
    return service.list_reservations(room_id, day)


@router.post("/", response_model=ReservationRead, status_code=201)
def create_reservation(data: ReservationCreate, service: ReservationServiceDep):
    return service.create_reservation(data)


@router.get("/{reservation_id}", response_model=ReservationRead)
def get_reservation(reservation_id: int, service: ReservationServiceDep):
    return service.get_reservation(reservation_id)


@router.put("/{reservation_id}", response_model=ReservationRead)
def update_reservation(
    reservation_id: int, data: ReservationCreate, service: ReservationServiceDep
):
    return service.update_reservation(reservation_id, data)


@router.delete("/{reservation_id}", status_code=204)
def delete_reservation(reservation_id: int, service: ReservationServiceDep):
    service.delete_reservation(reservation_id)
