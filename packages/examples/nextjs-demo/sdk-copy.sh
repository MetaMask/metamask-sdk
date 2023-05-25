#!/bin/bash

# Make sure to start from base workspace folder
reldir="$( dirname -- "$0"; )";
cd "$reldir/../../..";
SDK_WORKSPACE_DIR="$( pwd; )";
COMM_LAYER_DIR="$SDK_WORKSPACE_DIR/packages/sdk-communication-layer"
SDK_DIR="$SDK_WORKSPACE_DIR/packages/sdk"
MODAL_DIR="$SDK_WORKSPACE_DIR/packages/sdk-install-modal-web"
DAPP_DIR="$SDK_WORKSPACE_DIR/packages/examples/nextjs-demo"

echo "SDK_DIR: $SDK_DIR"
echo "COMM_LAYER_DIR: $COMM_LAYER_DIR"
echo "MODAL_DIR: $MODAL_DIR"
echo "DAPPDIR_EXAMPLE_DIR: $DAPP_DIR"

cd $DAPP_DIR
echo "Hack Metamask sdk && sdk-communication-layer && sdk-install-modal-web packages..."
## hack to debug to latest unpublished version of the sdk
rm -rf node_modules/@metamask/sdk-communication-layer
cp -rf $COMM_LAYER_DIR node_modules/@metamask/

rm -rf node_modules/@metamask/sdk
cp -rf $SDK_DIR node_modules/@metamask/

rm -rf node_modules/@metamask/sdk-install-modal-web
cp -rf $MODAL_DIR node_modules/@metamask/


echo "All done."
