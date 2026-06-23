from fastapi.testclient import TestClient

from app.main import app
from app.version import __version__


def test_get_version_returns_current_version():
    client = TestClient(app)
    response = client.get("/api/version")

    assert response.status_code == 200
    assert response.json() == {"version": __version__}
