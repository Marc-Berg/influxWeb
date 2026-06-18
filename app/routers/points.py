from fastapi import APIRouter

from app.deps import InfluxClientDep
from app.models.points import PointQueryRequest, PointQueryResponse
from app.services import query as query_service

router = APIRouter(prefix="/api/points", tags=["points"])


@router.post("/query", response_model=PointQueryResponse)
def query_points(request: PointQueryRequest, client: InfluxClientDep) -> PointQueryResponse:
    rows, truncated = query_service.query_points(client, request, request, request.limit)
    return PointQueryResponse(points=rows, truncated=truncated)
