#!/bin/bash

# Make sure to start from base workspace folder
reldir="$( dirname -- "$0"; )";
cd "$reldir/../../..";
SDK_WORKSPACE_DIR="$( pwd; )";
COMM_LAYER_DIR="$SDK_WORKSPACE_DIR/packages/sdk-communication-layer/dist"
SDK_DIR="$SDK_WORKSPACE_DIR/packages/sdk/dist"
SDK_REACT_DIR="$SDK_WORKSPACE_DIR/packages/sdk-react/dist"
SDK_UI_DIR="$SDK_WORKSPACE_DIR/packages/sdk-ui/dist"

DAPP_DIR="$SDK_WORKSPACE_DIR/packages/examples/reactNativeDemo"

echo "SDK_DIR: $SDK_DIR"
echo "COMM_LAYER_DIR: $COMM_LAYER_DIR"
echo "DAPP_DIR: $DAPP_DIR"
echo "SDK_REACT_DIR: $SDK_REACT_DIR"
echo "SDK_UI_DIR: $SDK_UI_DIR"

echo "########### START REPLACING SDK_COMMUNICATION_LAYER #########"

cd $DAPP_DIR
echo "Hack Metamask sdk && sdk-communication-layer packages..."
## hack to debug to latest unpublished version of the sdk
rm -rf node_modules/@metamask/sdk-communication-layer/dist node_modules/@metamask/sdk/dist node_modules/@metamask/sdk-react/dist node_modules/@metamask/sdk-ui/dist
cp -rf $COMM_LAYER_DIR node_modules/@metamask/sdk-communication-layer/
cp -rf $SDK_DIR node_modules/@metamask/sdk/
cp -rf $SDK_REACT_DIR node_modules/@metamask/sdk-react/
# cp -rf $SDK_UI_DIR node_modules/@metamask/sdk-ui/



echo "All done."
