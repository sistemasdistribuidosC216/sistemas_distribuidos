from fastapi.testclient import TestClient

from main import app


def preflight(origin):
    return TestClient(app).options(
        "/items/",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )


def test_cors_allows_frontend_origin():
    response = preflight("http://localhost:5173")
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_cors_blocks_unknown_origin():
    response = preflight("http://evil.example.com")
    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers
