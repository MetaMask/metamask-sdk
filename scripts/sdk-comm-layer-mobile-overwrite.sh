#!/bin/bash

# Make sure to start from base workspace folder
reldir="$( dirname -- "$0"; )";
cd "$reldir/..";
SDK_WORKSPACE_DIR="$( pwd; )";
ENV_FILE="$SDK_WORKSPACE_DIR/.env"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found in $SDK_WORKSPACE_DIR"
    exit 1
fi

# Read MM_MOBILE_PATH from .env file
export $(grep -v '^#' $ENV_FILE | xargs)

# Check if MM_MOBILE_PATH is set
if [ -z "$MM_MOBILE_PATH" ]; then
    echo "Error: MM_MOBILE_PATH not set in .env file"
    exit 1
fi

COMM_LAYER_DIR="$SDK_WORKSPACE_DIR/packages/sdk-communication-layer"

echo "MM_MOBILE_PATH: $MM_MOBILE_PATH"
echo "SDK_WORKSPACE_DIR: $SDK_WORKSPACE_DIR"
echo "COMM_LAYER_DIR: $COMM_LAYER_DIR"

echo "########### START REPLACING SDK_COMMUNICATION_LAYER #########"

cd $COMM_LAYER_DIR
echo "building sdk-communication-layer..."
yarn build

echo "Hack Metamask Mobile with sdk-communication-layer package..."
cd $MM_MOBILE_PATH
## dirty hack to debug
rm -rf node_modules/@metamask/sdk-communication-layer
cp -rf $COMM_LAYER_DIR node_modules/@metamask/
node_modules/.bin/rn-nodeify --install 'crypto,buffer,react-native-randombytes,vm,stream,http,https,os,url,net,fs' --hack

echo "All done."
