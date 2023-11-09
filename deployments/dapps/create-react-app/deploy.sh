#!/bin/bash
VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[", ]//g')
# extract package name package.json using jq
NAME=$(cat package.json | jq -r '.name')

echo "Building ${NAME}..."
docker login

docker buildx build --platform linux/amd64,linux/arm64 -t yourusername/my-react-app:latest --push .
