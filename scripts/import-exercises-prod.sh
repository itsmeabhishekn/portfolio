#!/usr/bin/env bash
# Load the shared exercise taxonomy into the production database.
# Does not install Node on the host; runs through Docker.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="$ROOT/squat-api"
COMPOSE=(compose -f docker-compose.prod.yml)

if [[ ! -f "$API/.env" ]]; then
  echo "Missing $API/.env (needs production DATABASE_URL)." >&2
  exit 1
fi

docker_bin() {
  if docker info >/dev/null 2>&1; then
    echo docker
  elif sudo -n docker info >/dev/null 2>&1; then
    echo "sudo docker"
  else
    echo "Cannot talk to Docker. Add this user to the docker group or use sudo." >&2
    exit 1
  fi
}

DOCKER="$(docker_bin)"

compose() {
  # shellcheck disable=SC2086
  $DOCKER "${COMPOSE[@]}" "$@"
}

cd "$API"
compose --profile import run --rm --build import-exercises
