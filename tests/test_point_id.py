from app.utils.point_id import encode_point_id


def test_deterministic_for_same_inputs():
    id_a = encode_point_id("bucket1", "temperature", {"room": "kitchen", "sensor": "s1"}, "2026-06-17T11:50:55Z")
    id_b = encode_point_id("bucket1", "temperature", {"room": "kitchen", "sensor": "s1"}, "2026-06-17T11:50:55Z")
    assert id_a == id_b


def test_tag_order_does_not_affect_id():
    id_a = encode_point_id("b", "m", {"a": "1", "b": "2"}, "2026-01-01T00:00:00Z")
    id_b = encode_point_id("b", "m", {"b": "2", "a": "1"}, "2026-01-01T00:00:00Z")
    assert id_a == id_b


def test_different_time_gives_different_id():
    id_a = encode_point_id("b", "m", {}, "2026-01-01T00:00:00Z")
    id_b = encode_point_id("b", "m", {}, "2026-01-01T00:00:01Z")
    assert id_a != id_b
