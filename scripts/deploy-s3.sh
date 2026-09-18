#!/usr/bin/env bash
# Upload the Next static export (out/) to the existing portfolio bucket.
# Bucket: abhishek-portfolio-static-assets (us-east-1)
# Optional: CLOUDFRONT_DISTRIBUTION_ID for cache invalidation
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BUCKET="${S3_BUCKET:-abhishek-portfolio-static-assets}"
REGION="${AWS_REGION:-us-east-1}"
DIST="${CLOUDFRONT_DISTRIBUTION_ID:-E2V487SWQND0VX}"

if ! command -v aws >/dev/null 2>&1; then
  if [[ -x "$HOME/.local/bin/aws" ]]; then
    PATH="$HOME/.local/bin:$PATH"
  else
    echo "AWS CLI is not installed. Install it, then run aws configure." >&2
    exit 1
  fi
fi

if [[ "${SKIP_BUILD:-}" != "1" ]]; then
  npm run build
fi

if [[ ! -d out ]]; then
  echo "No out/ folder. Run npm run build first." >&2
  exit 1
fi

# Hashed assets can be cached forever. HTML and the rest must revalidate.
aws s3 sync out/ "s3://${BUCKET}" \
  --region "$REGION" \
  --delete \
  --cache-control "public, max-age=0, must-revalidate"

aws s3 sync out/_next/static "s3://${BUCKET}/_next/static" \
  --region "$REGION" \
  --cache-control "public, max-age=31536000, immutable" \
  --metadata-directive REPLACE

# /squat/login (no trailing slash) is a missing S3 key and 403s unless this
# object exists. Directory index.html covers the slash form.
if [[ -f out/squat/index.html ]]; then
  for route in login dashboard programs exercises progress history profile; do
    aws s3 cp out/squat/index.html "s3://${BUCKET}/squat/${route}" \
      --region "$REGION" \
      --content-type "text/html; charset=utf-8" \
      --cache-control "public, max-age=0, must-revalidate"
  done
fi

if [[ -n "$DIST" ]]; then
  aws cloudfront create-invalidation \
    --distribution-id "$DIST" \
    --paths "/*" \
    --no-cli-pager
  echo "CloudFront invalidation submitted for ${DIST}."
fi

echo "Uploaded out/ to s3://${BUCKET}"
