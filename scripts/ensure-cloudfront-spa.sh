#!/usr/bin/env bash
# Keep the CloudFront Function that rewrites /squat/workout/:id (and other SPA
# paths) to /squat/index.html. S3 REST origins 403 missing keys, so UUID routes
# cannot be pre-copied as objects.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="${CLOUDFRONT_FUNCTION_NAME:-portfolio-url-rewrite}"
DIST="${CLOUDFRONT_DISTRIBUTION_ID:-E2V487SWQND0VX}"
CODE="$ROOT/scripts/cloudfront-url-rewrite.js"

if [[ ! -f "$CODE" ]]; then
  echo "Missing $CODE" >&2
  exit 1
fi

if ! command -v aws >/dev/null 2>&1 && [[ -x "$HOME/.local/bin/aws" ]]; then
  PATH="$HOME/.local/bin:$PATH"
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "AWS CLI is not installed; skipping CloudFront SPA rewrite." >&2
  exit 0
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required to update the CloudFront Function." >&2
  exit 1
fi

python3 - "$NAME" "$DIST" "$CODE" <<'PY'
import json
import subprocess
import sys

name, dist, code_path = sys.argv[1], sys.argv[2], sys.argv[3]
config = json.dumps({"Comment": "Rewrite Squat SPA routes to /squat/index.html", "Runtime": "cloudfront-js-2.0"})


def aws(*args, raw=False):
    result = subprocess.run(
        ["aws", "cloudfront", *args, "--output", "json"],
        check=True,
        capture_output=True,
        text=True,
    )
    if raw:
        return result.stdout
    if not result.stdout.strip():
        return {}
    return json.loads(result.stdout)


listed = aws("list-functions")
exists = any(item.get("Name") == name for item in listed.get("FunctionList", {}).get("Items", []))

if exists:
    described = aws("describe-function", "--name", name, "--stage", "DEVELOPMENT")
    etag = described["ETag"]
    updated = subprocess.run(
        [
            "aws",
            "cloudfront",
            "update-function",
            "--name",
            name,
            "--if-match",
            etag,
            "--function-config",
            config,
            "--function-code",
            f"fileb://{code_path}",
            "--output",
            "json",
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    etag = json.loads(updated.stdout)["ETag"]
else:
    created = subprocess.run(
        [
            "aws",
            "cloudfront",
            "create-function",
            "--name",
            name,
            "--function-config",
            config,
            "--function-code",
            f"fileb://{code_path}",
            "--output",
            "json",
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    etag = json.loads(created.stdout)["ETag"]

published = aws("publish-function", "--name", name, "--if-match", etag)
arn = published["FunctionSummary"]["FunctionMetadata"]["FunctionARN"]

cfg_raw = subprocess.run(
    ["aws", "cloudfront", "get-distribution-config", "--id", dist, "--output", "json"],
    check=True,
    capture_output=True,
    text=True,
)
payload = json.loads(cfg_raw.stdout)
etag = payload["ETag"]
config_doc = payload["DistributionConfig"]
behavior = config_doc["DefaultCacheBehavior"]
items = behavior.get("FunctionAssociations", {}).get("Items", [])
items = [item for item in items if item.get("EventType") != "viewer-request"]
items.append({"FunctionARN": arn, "EventType": "viewer-request"})
behavior["FunctionAssociations"] = {"Quantity": len(items), "Items": items}

subprocess.run(
    [
        "aws",
        "cloudfront",
        "update-distribution",
        "--id",
        dist,
        "--if-match",
        etag,
        "--distribution-config",
        json.dumps(config_doc),
        "--output",
        "json",
        "--no-cli-pager",
    ],
    check=True,
)
print(f"CloudFront Function {name} published and attached to {dist} as viewer-request.")
PY
