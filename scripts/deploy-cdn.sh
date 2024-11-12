#!/bin/bash

# Stop on first error
set -e

# Make sure to start from base workspace folder
reldir="$( dirname -- "$0"; )";
cd "$reldir/..";

build_sdk() {
    echo "\n---------- Building SDK -------------\n"
    yarn build
    echo "\n---------- Done building SDK -------------\n"
}

copy_to_deployment_dir() {
    local deployment_dir=$1
    echo "\n---------- Copying to deployment directory -------------\n"
    cp -r packages/sdk/dist/browser/iife/metamask-sdk.js "$deployment_dir"
    cp -r packages/sdk/dist/browser/iife/metamask-sdk.js.map "$deployment_dir"
    echo "\n---------- Done copying to deployment directory -------------\n"
}

# ------ Start
deployment_folder="cdn"
gh_tag=$tag
gh_tag_version=$(echo "$gh_tag" | sed -E 's/@metamask\/sdk@([0-9]+\.[0-9]+\.[0-9]+).*/\1/')

# Sanitize tag version
deployment_dir="deployments/$deployment_folder/$gh_tag_version"

echo "Deployment folder: $deployment_folder"
echo "Deployment directory: $deployment_dir"

mkdir -p "$deployment_dir"

# Build SDK from root
build_sdk

# Copy to deployment directory
copy_to_deployment_dir "$deployment_dir"