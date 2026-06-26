#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

db_cid=""
api_pid=""
web_pid=""

cleanup() {
  for pid in "$api_pid" "$web_pid"; do
    if [[ -n "$pid" ]]; then
      kill -TERM "-$pid" >/dev/null 2>&1 || true
    fi
  done
  sleep 1
  for pid in "$api_pid" "$web_pid"; do
    if [[ -n "$pid" ]]; then
      kill -KILL "-$pid" >/dev/null 2>&1 || true
    fi
  done
  if [[ -n "$db_cid" ]]; then
    docker rm -f "$db_cid" >/dev/null 2>&1 || true
  fi
}

wait_for_url() {
  local url="$1"
  local attempts="${2:-120}"

  for _ in $(seq 1 "$attempts"); do
    if node -e "fetch(process.argv[1]).then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))" "$url"; then
      return 0
    fi
    sleep 1
  done

  echo "Timed out waiting for $url" >&2
  return 1
}

run_with_retry() {
  local attempts="$1"
  shift

  for attempt in $(seq 1 "$attempts"); do
    if "$@"; then
      return 0
    fi
    if [[ "$attempt" != "$attempts" ]]; then
      sleep 2
    fi
  done

  return 1
}

trap cleanup EXIT INT TERM

if [[ -z "${COMATRIX_DATABASE_URL:-}" ]]; then
  if ! command -v docker >/dev/null 2>&1; then
    echo "COMATRIX_DATABASE_URL is not set and docker is unavailable" >&2
    exit 1
  fi

  db_name="comatrix-e2e-pg-$$"
  db_cid="$(
    docker run --rm -d \
      --name "$db_name" \
      -e POSTGRES_DB=comatrix \
      -e POSTGRES_USER=comatrix \
      -e POSTGRES_PASSWORD=comatrix \
      -p 127.0.0.1::5432 \
      postgres:17-alpine
  )"
  db_port="$(docker port "$db_cid" 5432/tcp | awk -F: '{print $NF}')"

  for _ in $(seq 1 60); do
    if docker exec "$db_cid" pg_isready -U comatrix -d comatrix >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
  docker exec "$db_cid" pg_isready -U comatrix -d comatrix >/dev/null

  export COMATRIX_DATABASE_URL="postgres://comatrix:comatrix@127.0.0.1:${db_port}/comatrix"
fi

run_with_retry 3 yarn db:migrate
yarn db:seed
yarn build:packages

setsid yarn workspace @comatrix/api dev &
api_pid="$!"

setsid yarn workspace @comatrix/web dev &
web_pid="$!"

wait_for_url 'http://127.0.0.1:4000/healthz'
wait_for_url 'http://127.0.0.1:4200'

yarn --cwd apps/web playwright test --config playwright.config.ts
