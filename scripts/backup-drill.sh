#!/bin/sh
# The restore drill (docs/01 §4): prove a backup restores BEFORE the pilot,
# not after the first incident. Dumps the compose db, restores it into a
# scratch database, and compares row counts on the tables that matter.
# The R2 upload/download legs live in backup.sh; this drill proves the part
# that actually saves you — dump -> restore -> data intact.
#
#   sh scripts/backup-drill.sh              (uses the dev compose overlay)
set -eu

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.dev.yml"
STAMP=$(date -u +%Y%m%d-%H%M%S)
DUMP="/tmp/teman-drill-$STAMP.sql.gz"

echo "1/4 dumping…"
$COMPOSE exec -T db pg_dump -U teman teman | gzip > "$DUMP"
echo "     $(du -h "$DUMP" | cut -f1) written"

echo "2/4 creating scratch database…"
$COMPOSE exec -T db psql -U teman -d postgres -q -c "DROP DATABASE IF EXISTS teman_drill;"
$COMPOSE exec -T db psql -U teman -d postgres -q -c "CREATE DATABASE teman_drill;"

echo "3/4 restoring…"
gunzip -c "$DUMP" | $COMPOSE exec -T db psql -U teman -d teman_drill -q

echo "4/4 comparing row counts…"
FAIL=0
for tbl in person request session verification report audit_log message; do
  a=$($COMPOSE exec -T db psql -U teman -d teman -tAc "SELECT count(*) FROM $tbl")
  b=$($COMPOSE exec -T db psql -U teman -d teman_drill -tAc "SELECT count(*) FROM $tbl")
  if [ "$a" = "$b" ]; then
    echo "     $tbl: $a = $b ok"
  else
    echo "     $tbl: $a != $b MISMATCH"; FAIL=1
  fi
done

$COMPOSE exec -T db psql -U teman -d postgres -q -c "DROP DATABASE teman_drill;"
rm -f "$DUMP"

[ "$FAIL" = "0" ] && echo "drill: RESTORE PROVEN" || { echo "drill: FAILED"; exit 1; }
