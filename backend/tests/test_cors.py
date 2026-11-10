from fastapi.testclient import TestClient

from app.main import app


def preflight(origin, method="POST"):
    return TestClient(app).options(
        "/rooms/",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": method,
            "Access-Control-Request-Headers": "content-type",
        },
    )


def test_cors_allows_frontend_origin():
    response = preflight("http://localhost:5173", method="DELETE")
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_cors_blocks_unknown_origin():
    response = preflight("http://site-desconhecido.com")
    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers
