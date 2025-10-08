#!/usr/bin/env bash

set -euo pipefail

if [[ $# -eq 0 ]]; then
  echo "Missing package name."
  exit 1
fi

package_name="$1"
shift  # remove package name from arguments

# Get the script directory and find the root node_modules
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [[ "${GITHUB_REF:-}" =~ '^release/' ]]; then
  "${ROOT_DIR}/node_modules/.bin/auto-changelog" validate --prettier --tag-prefix "${package_name}@" --rc "$@"
else
  "${ROOT_DIR}/node_modules/.bin/auto-changelog" validate --prettier --tag-prefix "${package_name}@" "$@"
fi
