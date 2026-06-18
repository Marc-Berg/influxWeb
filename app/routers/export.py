import json

from fastapi import APIRouter
from fastapi.responses import Response

from app.deps import InfluxClientDep
from app.models.points import ExportSelectedRequest, PointQueryRequest
from app.services import ods_io
from app.services import query as query_service

router = APIRouter(prefix="/api/export", tags=["export"])

ODS_MEDIA_TYPE = "application/vnd.oasis.opendocument.spreadsheet"


@router.get("/ods")
def export_ods(selection_json: str, client: InfluxClientDep) -> Response:
    request = PointQueryRequest(**json.loads(selection_json))
    rows, _ = query_service.query_points(client, request, request, request.limit)
    content = ods_io.build_ods(request.bucket, rows)
    return Response(
        content=content,
        media_type=ODS_MEDIA_TYPE,
        headers={"Content-Disposition": "attachment; filename=influxweb-export.ods"},
    )


@router.post("/ods/selected")
def export_ods_selected(request: ExportSelectedRequest) -> Response:
    content = ods_io.build_ods(request.bucket, request.points)
    return Response(
        content=content,
        media_type=ODS_MEDIA_TYPE,
        headers={"Content-Disposition": "attachment; filename=influxweb-export.ods"},
    )
