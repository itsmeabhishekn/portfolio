#!/usr/bin/env bash
# Pull main and rebuild the Squat API on the host (EC2).
# Frontend static files are a separate path: scripts/deploy-s3.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="$ROOT/squat-api"
COMPOSE=(compose -f docker-compose.prod.yml)
HEALTH_URL="http://127.0.0.1:3001/health"

cd "$ROOT"

if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  echo "Repo has uncommitted changes. Commit or stash them, then retry." >&2
  git status --porcelain --untracked-files=no >&2
  exit 1
fi

if [[ "${SKIP_PULL:-}" != "1" ]]; then
  git pull --ff-only
fi

echo "Deploying $(git rev-parse --short HEAD) ($(git log -1 --pretty=%s))"

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

echo "Applying migrations..."
compose run --rm --build migrate

echo "Rebuilding and restarting squat-api..."
compose up -d --build --remove-orphans

echo "Waiting for $HEALTH_URL"
for _ in $(seq 1 30); do
  if curl -sf "$HEALTH_URL" >/dev/null; then
    echo "squat-api is up at $HEALTH_URL"
    compose ps
    exit 0
  fi
  sleep 2
done

echo "squat-api did not become healthy. Recent logs:" >&2
compose logs --tail 80 squat-api >&2
exit 1
