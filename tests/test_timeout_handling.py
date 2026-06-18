from fastapi.testclient import TestClient
from urllib3.exceptions import ReadTimeoutError

from app.influx_client import get_influx_client
from app.main import app


class _TimingOutQueryApi:
    def query(self, flux):
        raise ReadTimeoutError(pool=None, url=None, message="Read timed out.")


class _TimingOutClient:
    def query_api(self):
        return _TimingOutQueryApi()


def test_influx_read_timeout_returns_helpful_504():
    app.dependency_overrides[get_influx_client] = lambda: _TimingOutClient()
    try:
        client = TestClient(app)
        response = client.post(
            "/api/points/query",
            json={"bucket": "b", "measurements": [], "tags": {}, "start": "-1h", "stop": "now()"},
        )
    finally:
        app.dependency_overrides.pop(get_influx_client, None)

    assert response.status_code == 504
    assert "timed out" in response.json()["detail"]
    assert "fewer" in response.json()["detail"]
