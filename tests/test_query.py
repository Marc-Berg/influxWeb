from datetime import datetime, timezone

from app.models.points import Selection, TimeRange
from app.services import query as query_service


class _FakeRecord:
    def __init__(self, index: int):
        self.values = {"_measurement": "m", "_field": "value", "result": "_result", "table": 0}

    def get_time(self):
        return datetime(2026, 6, 18, tzinfo=timezone.utc)

    def get_measurement(self):
        return "m"

    def get_field(self):
        return "value"

    def get_value(self):
        return 1.0


class _FakeQueryApi:
    def __init__(self, total_records: int):
        self.total_records = total_records

    def query_stream(self, flux):
        return (_FakeRecord(i) for i in range(self.total_records))


class _FakeClient:
    def __init__(self, total_records: int):
        self.total_records = total_records

    def query_api(self):
        return _FakeQueryApi(self.total_records)


def _selection() -> tuple[Selection, TimeRange]:
    return Selection(bucket="b"), TimeRange(start="-1h", stop="now()")


def test_result_under_cap_is_not_truncated():
    selection, time_range = _selection()
    rows, truncated = query_service.query_points(_FakeClient(5), selection, time_range, None)
    assert len(rows) == 5
    assert truncated is False


def test_result_exactly_at_cap_is_not_truncated():
    selection, time_range = _selection()
    rows, truncated = query_service.query_points(_FakeClient(10), selection, time_range, 10)
    assert len(rows) == 10
    assert truncated is False


def test_result_over_cap_is_truncated_at_the_cap():
    selection, time_range = _selection()
    rows, truncated = query_service.query_points(_FakeClient(100), selection, time_range, 10)
    assert len(rows) == 10
    assert truncated is True


def test_no_limit_falls_back_to_the_hard_max(monkeypatch):
    monkeypatch.setattr(query_service, "MAX_QUERY_POINTS", 7)
    selection, time_range = _selection()
    rows, truncated = query_service.query_points(_FakeClient(100), selection, time_range, None)
    assert len(rows) == 7
    assert truncated is True


def test_requested_limit_above_hard_max_is_clamped(monkeypatch):
    monkeypatch.setattr(query_service, "MAX_QUERY_POINTS", 7)
    selection, time_range = _selection()
    rows, truncated = query_service.query_points(_FakeClient(100), selection, time_range, 1_000_000)
    assert len(rows) == 7
    assert truncated is True
