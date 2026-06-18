from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from urllib3.exceptions import TimeoutError as Urllib3TimeoutError

from app.routers import buckets, delete, export, points, schema

app = FastAPI(title="influxWeb")

app.include_router(buckets.router)
app.include_router(schema.router)
app.include_router(points.router)
app.include_router(export.router)
app.include_router(delete.router)


@app.exception_handler(Urllib3TimeoutError)
def handle_influx_timeout(request: Request, exc: Urllib3TimeoutError) -> JSONResponse:
    return JSONResponse(
        status_code=504,
        content={
            "detail": "The request to InfluxDB timed out. Try selecting fewer measurements/tags "
            "or a shorter time range, then try again."
        },
    )

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
