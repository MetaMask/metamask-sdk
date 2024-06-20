#!/bin/bash

# Exit on error
set -e

# Check if a version argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

# Make sure to start from base workspace folder
reldir="$( dirname -- "$0"; )";
cd "$reldir/..";

VERSION=$1

# List of public packages
packages=(
  "packages/sdk-install-modal-web"
  "packages/sdk-communication-layer"
  "packages/sdk"
  "packages/sdk-react"
  "packages/sdk-react-native"
  "packages/sdk-react-ui"
  "packages/sdk-ui"
)

# Loop through each package and update the .change file
for package in "${packages[@]}"; do
  echo "Updating $package/.change to version $VERSION"
  echo "$VERSION" > "$package/.change"
done

echo "All .change files updated to version $VERSION"
