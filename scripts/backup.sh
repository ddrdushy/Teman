#!/bin/sh
# Nightly pg_dump, gzipped, GPG-encrypted with BACKUP_PASSPHRASE, pushed to R2.
# 30-day retention. Restore-test this once BEFORE the pilot, not after the
# first incident:
#   aws s3 cp s3://$R2_BUCKET_BACKUP/<file> - --endpoint-url "$R2_ENDPOINT" \
#     | gpg --batch --passphrase "$BACKUP_PASSPHRASE" -d | gunzip \
#     | psql "$SCRATCH_DATABASE_URL"
set -eu

STAMP=$(date -u +%Y-%m-%d)
FILE="teman-${STAMP}.sql.gz.gpg"

pg_dump -h db -U "$POSTGRES_USER" "$POSTGRES_DB" \
  | gzip \
  | gpg --batch --yes --symmetric --cipher-algo AES256 \
        --passphrase "$BACKUP_PASSPHRASE" -o "/tmp/$FILE"

aws s3 cp "/tmp/$FILE" "s3://$R2_BUCKET_BACKUP/$FILE" --endpoint-url "$R2_ENDPOINT"
rm -f "/tmp/$FILE"

# Retention: delete anything older than 30 days.
CUTOFF=$(date -u -d "@$(( $(date -u +%s) - 30*86400 ))" +%Y-%m-%d 2>/dev/null \
      || date -u -v-30d +%Y-%m-%d)
aws s3 ls "s3://$R2_BUCKET_BACKUP/" --endpoint-url "$R2_ENDPOINT" \
  | awk '{print $4}' \
  | while read -r key; do
      [ -n "$key" ] || continue
      day=$(printf '%s' "$key" | sed -n 's/^teman-\([0-9-]\{10\}\)\..*/\1/p')
      [ -n "$day" ] || continue
      if [ "$day" \< "$CUTOFF" ]; then
        aws s3 rm "s3://$R2_BUCKET_BACKUP/$key" --endpoint-url "$R2_ENDPOINT"
      fi
    done

echo "backup: $FILE uploaded, retention pruned to 30 days"
