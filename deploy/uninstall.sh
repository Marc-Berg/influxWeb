#!/usr/bin/env bash
# Installed by install.sh as /usr/local/bin/influxweb-uninstall - stops and
# completely removes influxWeb (service, install directory incl. .env, the
# dedicated system user, and the influxweb-upgrade/influxweb-uninstall
# commands themselves), after an explicit confirmation prompt.
set -euo pipefail

INSTALL_DIR="/opt/influxweb"
SERVICE_USER="influxweb"

GREEN='\033[0;32m'
NC='\033[0m'
step() { echo -e "${GREEN}==> $1${NC}"; }

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run this as root, e.g.: sudo influxweb-uninstall" >&2
  exit 1
fi

echo "This will remove:"
echo "  - the influxweb systemd service (stopped and disabled)"
echo "  - $INSTALL_DIR, including its .env config"
echo "  - the '$SERVICE_USER' system user"
echo "  - the influxweb-upgrade / influxweb-uninstall commands"
read -rp "Type 'yes' to continue: " confirm
if [[ "$confirm" != "yes" ]]; then
  echo "Aborted, nothing was removed."
  exit 1
fi

step "Stopping and disabling the influxweb service..."
systemctl disable --now influxweb 2>/dev/null || true
rm -f /etc/systemd/system/influxweb.service
systemctl daemon-reload

step "Removing $INSTALL_DIR..."
rm -rf "$INSTALL_DIR"

step "Removing the '$SERVICE_USER' system user..."
id -u "$SERVICE_USER" >/dev/null 2>&1 && userdel "$SERVICE_USER"

step "Removing the influxweb-upgrade / influxweb-uninstall commands..."
rm -f /usr/local/bin/influxweb-upgrade /usr/local/bin/influxweb-uninstall

echo "influxWeb has been uninstalled."
