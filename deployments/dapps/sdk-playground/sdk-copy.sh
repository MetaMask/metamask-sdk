#!/bin/bash

# Make sure to start from base workspace folder
reldir="$( dirname -- "$0"; )";
cd "$reldir/../../..";
SDK_WORKSPACE_DIR="$( pwd; )";
COMM_LAYER_DIR="$SDK_WORKSPACE_DIR/packages/sdk-communication-layer"
SDK_DIR="$SDK_WORKSPACE_DIR/packages/sdk"
SDK_REACT_DIR="$SDK_WORKSPACE_DIR/packages/sdk-react"
SDK_REACT_UI_DIR="$SDK_WORKSPACE_DIR/packages/sdk-react-ui"
SDK_UI_DIR="$SDK_WORKSPACE_DIR/packages/sdk-ui"
SDK_LAB_DIR="$SDK_WORKSPACE_DIR/packages/sdk-lab"
SDK_INSTALL_MODAL_WEB_DIR="$SDK_WORKSPACE_DIR/packages/sdk-install-modal-web"

DAPP_DIR="$SDK_WORKSPACE_DIR/deployments/dapps/create-react-app"

echo "SDK_DIR: $SDK_DIR"
echo "COMM_LAYER_DIR: $COMM_LAYER_DIR"
echo "DAPP_DIR: $DAPP_DIR"
echo "SDK_REACT_DIR: $SDK_REACT_DIR"
echo "SDK_UI_DIR: $SDK_UI_DIR"
echo "SDK_LAB_DIR: $SDK_LAB_DIR"
echo "SDK_INSTALL_MODAL_WEB_DIR: $SDK_INSTALL_MODAL_WEB_DIR"

echo "########### START REPLACING SDK_COMMUNICATION_LAYER #########"

cd $DAPP_DIR
echo "Hack Metamask sdk && sdk-communication-layer packages..."
## hack to debug to latest unpublished version of the sdk
rm -rf node_modules/@metamask/sdk-communication-layer
echo "removed node_modules/@metamask/sdk-communication-layer"
rm -rf node_modules/@metamask/sdk
echo "removed node_modules/@metamask/sdk"
rm -rf node_modules/@metamask/sdk-react
echo "removed node_modules/@metamask/sdk-react"
rm -rf node_modules/@metamask/sdk-react-ui
echo "removed node_modules/@metamask/sdk-react-ui"
rm -rf node_modules/@metamask/sdk-ui
echo "removed node_modules/@metamask/sdk-ui"
rm -rf node_modules/@metamask/sdk-lab
echo "removed node_modules/@metamask/sdk-lab"
rm -rf node_modules/@metamask/sdk-install-modal-web
echo "removed node_modules/@metamask/sdk-install-modal-web"
rm -rf node_modules/@web3-onboard/metamask

echo "Begin copying sdk packages..."
# cp -rf $COMM_LAYER_DIR node_modules/@metamask/
# cp -rf $SDK_DIR node_modules/@metamask/
# cp -rf $SDK_REACT_DIR node_modules/@metamask/
# cp -rf $SDK_REACT_UI_DIR node_modules/@metamask/
# cp -rf $SDK_UI_DIR node_modules/@metamask/
# cp -rf $SDK_LAB_DIR node_modules/@metamask/
# cp -rf $SDK_INSTALL_MODAL_WEB_DIR node_modules/@metamask/
# Create symlinks to local packages
ln -s $COMM_LAYER_DIR node_modules/@metamask/sdk-communication-layer
ln -s $SDK_DIR node_modules/@metamask/sdk
ln -s $SDK_REACT_DIR node_modules/@metamask/sdk-react
ln -s $SDK_REACT_UI_DIR node_modules/@metamask/sdk-react-ui
ln -s $SDK_UI_DIR node_modules/@metamask/sdk-ui
ln -s $SDK_LAB_DIR node_modules/@metamask/sdk-lab
ln -s $SDK_INSTALL_MODAL_WEB_DIR node_modules/@metamask/sdk-install-modal-web
ln -s /Volumes/FD/Projects/web3-onboard/packages/metamask node_modules/@web3-onboard/metamask

echo "All done."
