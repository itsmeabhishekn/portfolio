#!/usr/bin/env bash
# Load a program catalog into the production database from the API host.
# Does not install Node on the host; runs through Docker.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="$ROOT/squat-api"
COMPOSE=(compose -f docker-compose.prod.yml)

if [[ $# -lt 1 || "$1" == "-h" || "$1" == "--help" ]]; then
  echo "Usage: ./scripts/import-program-prod.sh you@example.com" >&2
  exit 1
fi

EMAIL="$1"

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
compose --profile import run --rm --build import-program --email "$EMAIL"
