from datetime import datetime, tzinfo
from pathlib import Path
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


def get_local_zone() -> tzinfo:
    # /etc/timezone gives the IANA zone name (e.g. "Europe/Berlin") on Debian/Raspberry
    # Pi OS, which - unlike a fixed UTC offset - applies the correct daylight-saving
    # rule per date. Falls back to whatever the system already resolves as local.
    try:
        name = Path("/etc/timezone").read_text().strip()
        return ZoneInfo(name)
    except (OSError, ZoneInfoNotFoundError):
        local_tzinfo = datetime.now().astimezone().tzinfo
        assert local_tzinfo is not None
        return local_tzinfo


def get_local_zone_name() -> str:
    zone = get_local_zone()
    return getattr(zone, "key", "the server's local time zone")
