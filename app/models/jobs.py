from pydantic import BaseModel

from app.models.points import PointRow, Selection, TimeRange


class DeleteRequest(Selection, TimeRange):
    pass


class DeletePreviewResponse(BaseModel):
    matched_count: int
    sample_points: list[PointRow]
    measurements_affected: list[str]
    resolved_start: str | None
    resolved_stop: str | None
    confirm_token: str


class DeleteExecuteRequest(Selection):
    resolved_start: str
    resolved_stop: str
    confirm_token: str


class DeleteExecuteResponse(BaseModel):
    status: str
    predicates: list[str]
    start: str
    stop: str


class PointRef(BaseModel):
    bucket: str
    measurement: str
    tags: dict[str, str]
    time: str


class DeleteSelectedPreviewRequest(BaseModel):
    points: list[PointRef]


class DeleteSelectedPreviewResponse(BaseModel):
    matched_count: int
    confirm_token: str


class DeleteSelectedExecuteRequest(BaseModel):
    points: list[PointRef]
    confirm_token: str


class DeleteSelectedExecuteResponse(BaseModel):
    status: str
    deleted_count: int
