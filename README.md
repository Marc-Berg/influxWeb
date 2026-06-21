# influxWeb

A web-based admin UI for a local InfluxDB v2 instance. Built for editing smarthome
telemetry (e.g. from ioBroker) without fighting the `influx` CLI: browse buckets,
filter datapoints by measurement/tag, inspect and edit values, fix timestamps,
delete ranges, and export/import data as ODS spreadsheets (for editing in
LibreOffice Calc with correct types, no CSV locale/decimal-separator guessing).

Runs as a small FastAPI backend + a static HTML/JS frontend (Tabulator.js), meant
for LAN-only deployment on something like a Raspberry Pi — no login, no internet
exposure.

## Status

Early development. Currently implemented:
- Bucket selection
- Measurement/tag schema browsing and selection, file-explorer-style (click,
  Ctrl+click, Shift+click), with a clear/reset action and a text filter
- Time range selection
- Querying and listing datapoints, with adjustable page size and multi-row
  selection (same click/Ctrl/Shift model as the schema tree); capped at
  200,000 points per query to keep memory use bounded regardless of how broad
  a selection is — narrow the measurement/tag/time filter if a result comes
  back marked as truncated
- Export to ODS (whole query result, or just the selected rows), with proper
  cell types (numbers, booleans, dates) and an instructions block describing
  the round-trip contract for a later import
- Delete points - either exactly the selected rows, or (with nothing selected)
  every row currently loaded in the table - with a preview and explicit
  confirmation before anything is deleted
- Edit a value inline (double-click a cell in the Value column) with a
  confirm-before-save step, or add a brand-new point via a separate modal -
  both share the same write path (overwrite by measurement+tags+timestamp,
  last-write-wins, same as InfluxDB itself)

Planned next: retime, timestamp normalization, ODS import — each behind the
same preview/confirm pattern used for delete.

## Sorting

Column headers use Tabulator's standard click behavior, not anything custom
to influxWeb:
- **Click** a header to sort by that column alone.
- **Shift+click** another header to add it as a further sort level. The
  most-recently Shift-clicked column becomes the new *primary* sort key, and
  any columns sorted before it become tiebreakers underneath it.

This takes a moment to get used to, but covers the common case of wanting to
read one measurement's values in chronological order without any extra UI:

1. Click **Time** to sort by it.
2. Shift+click **Measurement**. Measurement becomes the primary sort, with
   Time still applied underneath as the tiebreaker - so within each
   measurement, rows come out time-ordered.

## Setup

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .local_data/config.env   # then fill in INFLUX_URL / INFLUX_TOKEN / INFLUX_ORG
```

## Run (development)

```bash
.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8085
```

Open `http://localhost:8085/` (or `http://<host>:8085/` from another machine on the LAN -
uvicorn only listens on `127.0.0.1` unless `--host 0.0.0.0` is passed explicitly).

## Deployment (Raspberry Pi, systemd)

See `deploy/influxweb.service` for a unit template. Install into e.g. `/opt/influxweb`,
create the venv there, copy `.local_data/config.env` into place (never commit it), then:

```bash
sudo systemctl enable --now influxweb
```

influxWeb binds `0.0.0.0` by default — keep it reachable only from your LAN (no
router port-forward); there is no authentication built in.

## License

MIT, see [LICENSE](LICENSE).
