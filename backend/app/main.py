from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import reservations, rooms
from app.core.config import settings
from app.core.errors import DomainError

app = FastAPI(title="Reserva de Salas e Laboratórios")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type"],
)


@app.exception_handler(DomainError)
def handle_domain_error(request: Request, error: DomainError):
    return JSONResponse(
        status_code=error.status_code, content={"detail": error.message}
    )


app.include_router(rooms.router)
app.include_router(reservations.router)


@app.get("/health")
def health():
    return {"status": "ok"}
