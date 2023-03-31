#!/bin/bash

# Make sure to start from base workspace folder
reldir="$( dirname -- "$0"; )";
cd "$reldir/../../..";
SDK_WORKSPACE_DIR="$( pwd; )";
COMM_LAYER_DIR="$SDK_WORKSPACE_DIR/packages/sdk-communication-layer"
SDK_DIR="$SDK_WORKSPACE_DIR/packages/sdk"
RN_DIR="$SDK_WORKSPACE_DIR/packages/examples/reactNativeTSApp"

echo "SDK_DIR: $SDK_DIR"
echo "COMM_LAYER_DIR: $COMM_LAYER_DIR"
echo "RN_DIR: $RN_DIR"

echo "########### START REPLACING SDK_COMMUNICATION_LAYER #########"

cd $RN_DIR
echo "Hack Metamask sdk / sdk-communication-layer packages..."
## dirty hack to debug
rm -rf node_modules/@metamask/sdk-communication-layer node_modules/@metamask/sdk
cp -rf $COMM_LAYER_DIR node_modules/@metamask/
cp -rf $SDK_DIR node_modules/@metamask/


echo "All done."
