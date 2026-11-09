from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import items
from app.core.config import settings

app = FastAPI(title="Sistemas Distribuidos - Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(items.router)


@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend rodando com sucesso!"}
