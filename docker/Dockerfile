FROM python:3.12-alpine AS builder

ENV PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apk add --no-cache build-base libffi-dev

COPY requirements.txt ./

RUN python -m venv /opt/venv \
    && /opt/venv/bin/pip install --upgrade pip \
    && /opt/venv/bin/pip install --no-cache-dir -r requirements.txt


FROM python:3.12-alpine

ENV PATH="/opt/venv/bin:${PATH}" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
COPY app ./app
COPY static ./static

EXPOSE 8085

CMD ["sh", "-c", "uvicorn app.main:app --host ${BIND_HOST:-0.0.0.0} --port ${BIND_PORT:-8085} --log-level ${LOG_LEVEL:-info}"]
