from fastapi import FastAPI

app = FastAPI(title="Reserva de Salas e Laboratórios")


@app.get("/health")
def health():
    return {"status": "ok"}
