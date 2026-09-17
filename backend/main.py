from fastapi import FastAPI, HTTPException

app = FastAPI()


@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend rodando com sucesso!"}


@app.get("/items/{item_id}")
def read_item(item_id: int):
    if item_id < 0:
        raise HTTPException(status_code=400, detail="item_id deve ser positivo")
    return {"item_id": item_id}


@app.get("/sum")
def sum_numbers(a: int, b: int):
    return {"result": a + b}
