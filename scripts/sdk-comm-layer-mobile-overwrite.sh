#!/bin/bash

##############################
### EDIT THESE VALUES PATH ###
##############################
MM_MOBILE_PATH="~/Projects/metamask/metamask-mobile"
##############################
### STOP EDITING FROM HERE ###
##############################

# Make sure to start from base workspace folder
reldir="$( dirname -- "$0"; )";
cd "$reldir/..";
SDK_WORKSPACE_DIR="$( pwd; )";
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
