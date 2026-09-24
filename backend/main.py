from fastapi import FastAPI

from app.routers import items

app = FastAPI(title="Sistemas Distribuidos - Backend")

app.include_router(items.router)


@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend rodando com sucesso!"}
