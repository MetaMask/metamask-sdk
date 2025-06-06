#!/bin/bash

# Make sure to start from base workspace folder
reldir="$( dirname -- "$0"; )";
cd "$reldir/../../..";
SDK_WORKSPACE_DIR="$( pwd; )";
COMM_LAYER_DIR="$SDK_WORKSPACE_DIR/packages/sdk-communication-layer"
SDK_DIR="$SDK_WORKSPACE_DIR/packages/sdk"
SDK_INSTALL_MODAL_WEB_DIR="$SDK_WORKSPACE_DIR/packages/sdk-install-modal-web"
SDK_ANALYTICS_DIR="$SDK_WORKSPACE_DIR/packages/sdk-analytics"

DAPP_DIR="$SDK_WORKSPACE_DIR/packages/examples/with-web3onboard"

echo "SDK_DIR: $SDK_DIR"
echo "COMM_LAYER_DIR: $COMM_LAYER_DIR"
echo "DAPP_DIR: $DAPP_DIR"
echo "SDK_INSTALL_MODAL_WEB_DIR: $SDK_INSTALL_MODAL_WEB_DIR"
echo "SDK_ANALYTICS_DIR: $SDK_ANALYTICS_DIR"

echo "########### START REPLACING SDK_COMMUNICATION_LAYER #########"

cd $DAPP_DIR
echo "Hack Metamask sdk && sdk-communication-layer packages..."
## hack to debug to latest unpublished version of the sdk
rm -rf node_modules/@metamask/sdk-communication-layer/dist node_modules/@metamask/sdk/dist node_modules/@metamask/sdk-install-modal-web/dist node_modules/@metamask/sdk-analytics/dist
mkdir -p node_modules/@metamask/sdk-communication-layer
mkdir -p node_modules/@metamask/sdk
mkdir -p node_modules/@metamask/sdk-install-modal-web
mkdir -p node_modules/@metamask/sdk-analytics

cp -rf $COMM_LAYER_DIR/dist node_modules/@metamask/sdk-communication-layer/dist
cp -rf $COMM_LAYER_DIR/package.json node_modules/@metamask/sdk-communication-layer/package.json

cp -rf $SDK_DIR/dist node_modules/@metamask/sdk/dist
cp -rf $SDK_DIR/package.json node_modules/@metamask/sdk/package.json

cp -rf $SDK_INSTALL_MODAL_WEB_DIR/dist node_modules/@metamask/sdk-install-modal-web/dist
cp -rf $SDK_INSTALL_MODAL_WEB_DIR/package.json node_modules/@metamask/sdk-install-modal-web/package.json

cp -rf $SDK_ANALYTICS_DIR/dist node_modules/@metamask/sdk-analytics/dist
cp -rf $SDK_ANALYTICS_DIR/node_modules node_modules/@metamask/sdk-analytics/node_modules
cp -rf $SDK_ANALYTICS_DIR/package.json node_modules/@metamask/sdk-analytics/package.json

echo "All done."
