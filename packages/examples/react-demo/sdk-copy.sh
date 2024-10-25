#!/bin/bash

# Make sure to start from base workspace folder
reldir="$( dirname -- "$0"; )";
cd "$reldir/../../..";
SDK_WORKSPACE_DIR="$( pwd; )";
COMM_LAYER_DIR="$SDK_WORKSPACE_DIR/packages/sdk-communication-layer"
SDK_DIR="$SDK_WORKSPACE_DIR/packages/sdk"
SDK_REACT_DIR="$SDK_WORKSPACE_DIR/packages/sdk-react"
SDK_REACT_UI_DIR="$SDK_WORKSPACE_DIR/packages/sdk-react-ui"

DAPP_DIR="$SDK_WORKSPACE_DIR/packages/examples/nextjs-demo"

echo "SDK_DIR: $SDK_DIR"
echo "COMM_LAYER_DIR: $COMM_LAYER_DIR"
echo "DAPP_DIR: $DAPP_DIR"
echo "SDK_REACT_DIR: $SDK_REACT_DIR"
echo "SDK_REACT_UI_DIR: $SDK_REACT_UI_DIR"

echo "########### START REPLACING SDK_COMMUNICATION_LAYER #########"

cd $DAPP_DIR
echo "Hack Metamask sdk && sdk-communication-layer packages..."
## hack to debug to latest unpublished version of the sdk
rm -rf node_modules/@metamask/sdk-communication-layer/dist node_modules/@metamask/sdk/dist node_modules/@metamask/sdk-react/dist node_modules/@metamask/sdk-react-ui/dist
cp -rf $COMM_LAYER_DIR/dist node_modules/@metamask/sdk-communication-layer/dist
cp -rf $COMM_LAYER_DIR/package.json node_modules/@metamask/sdk-communication-layer/package.json

cp -rf $SDK_DIR/dist node_modules/@metamask/sdk/dist
cp -rf $SDK_DIR/package.json node_modules/@metamask/sdk/package.json

cp -rf $SDK_INSTALL_MODAL_WEB_DIR/dist node_modules/@metamask/sdk-install-modal-web/dist
cp -rf $SDK_INSTALL_MODAL_WEB_DIR/package.json node_modules/@metamask/sdk-install-modal-web/package.json



echo "All done."
