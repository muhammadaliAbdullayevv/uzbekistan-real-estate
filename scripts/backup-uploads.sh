#!/bin/bash
# Daily backup of user-uploaded listing photos (public/uploads/listings) to a
# separate directory on the same VPS, run via cron.
#
# This protects against accidental deletion or corruption of the live
# uploads directory. It does NOT protect against total disk or VPS loss --
# the backup lives on the same physical disk. True off-site backup needs a
# remote destination (another host, S3-compatible storage, etc.), which
# isn't configured here.
#
# Install (once): crontab -e, then add e.g.
#   0 3 * * * /opt/uzbekistan-rentals/scripts/backup-uploads.sh >> ~/uploads-backup.log 2>&1
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$SCRIPT_DIR/../public/uploads/listings"
BACKUP_DIR="${UPLOADS_BACKUP_DIR:-$HOME/uploads-backups}"
RETENTION_DAYS=14
DATE="$(date +%Y-%m-%d)"

mkdir -p "$BACKUP_DIR"

if [ -d "$SOURCE_DIR" ] && [ -n "$(ls -A "$SOURCE_DIR" 2>/dev/null)" ]; then
  tar -czf "$BACKUP_DIR/uploads-$DATE.tar.gz" -C "$(dirname "$SOURCE_DIR")" "$(basename "$SOURCE_DIR")"
  echo "$(date '+%Y-%m-%d %H:%M:%S') backed up $SOURCE_DIR -> $BACKUP_DIR/uploads-$DATE.tar.gz"
else
  echo "$(date '+%Y-%m-%d %H:%M:%S') nothing to back up ($SOURCE_DIR is empty or missing)"
fi

find "$BACKUP_DIR" -name "uploads-*.tar.gz" -mtime "+$RETENTION_DAYS" -delete
