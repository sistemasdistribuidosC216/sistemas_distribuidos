from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api import rooms
from app.core.errors import DomainError

app = FastAPI(title="Reserva de Salas e Laboratórios")


@app.exception_handler(DomainError)
def handle_domain_error(request: Request, error: DomainError):
    return JSONResponse(
        status_code=error.status_code, content={"detail": error.message}
    )


app.include_router(rooms.router)


@app.get("/health")
def health():
    return {"status": "ok"}
