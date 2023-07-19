#!/bin/bash

# Make sure to start from base workspace folder
reldir="$( dirname -- "$0"; )";
cd "$reldir/../../..";
SDK_WORKSPACE_DIR="$( pwd; )";
COMM_LAYER_DIR="$SDK_WORKSPACE_DIR/packages/sdk-communication-layer"
SDK_DIR="$SDK_WORKSPACE_DIR/packages/sdk"
SDK_REACT_DIR="$SDK_WORKSPACE_DIR/packages/sdk-react"
MODAL_DIR="$SDK_WORKSPACE_DIR/packages/sdk-install-modal-web"
DAPP_DIR="$SDK_WORKSPACE_DIR/packages/examples/create-react-app"

echo "SDK_DIR: $SDK_DIR"
echo "COMM_LAYER_DIR: $COMM_LAYER_DIR"
echo "MODAL_DIR: $MODAL_DIR"
echo "DAPPDIR_EXAMPLE_DIR: $DAPP_DIR"

cd $DAPP_DIR
echo "Hack Metamask sdk-react && sdk && sdk-communication-layer && sdk-install-modal-web packages..."
## hack to debug to latest unpublished version of the sdk
rm -rf node_modules/@metamask/sdk-communication-layer node_modules/@metamask/sdk node_modules/@metamask/sdk-install-modal-web node_modules/@metamask/sdk-react
cp -rf $COMM_LAYER_DIR node_modules/@metamask/
cp -rf $SDK_DIR node_modules/@metamask/
cp -rf $MODAL_DIR node_modules/@metamask/
cp -rf $SDK_REACT_DIR node_modules/@metamask/

echo "All done."
