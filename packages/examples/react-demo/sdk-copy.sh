#!/bin/bash

# Make sure to start from base workspace folder
reldir="$( dirname -- "$0"; )";
cd "$reldir/../../..";
SDK_WORKSPACE_DIR="$( pwd; )";
COMM_LAYER_DIR="$SDK_WORKSPACE_DIR/packages/sdk-communication-layer"
SDK_DIR="$SDK_WORKSPACE_DIR/packages/sdk"
SDK_REACT_DIR="$SDK_WORKSPACE_DIR/packages/sdk-react"
SDK_INSTALL_MODAL_WEB_DIR="$SDK_WORKSPACE_DIR/packages/sdk-install-modal-web"

DAPP_DIR="$SDK_WORKSPACE_DIR/packages/examples/react-demo"

echo "SDK_DIR: $SDK_DIR"
echo "COMM_LAYER_DIR: $COMM_LAYER_DIR"
echo "DAPP_DIR: $DAPP_DIR"
echo "SDK_REACT_DIR: $SDK_REACT_DIR"
echo "SDK_INSTALL_MODAL_WEB_DIR: $SDK_INSTALL_MODAL_WEB_DIR"

# Ask user if they want to rebuild
read -p "Do you want to rebuild the packages first? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "########### START BUILDING SDK PACKAGES #########"
    # Build SDK Communication Layer
    cd $COMM_LAYER_DIR
    yarn build

    # Build SDK
    cd $SDK_DIR
    yarn build

    # Build SDK React
    cd $SDK_REACT_DIR
    yarn build

    # Build SDK Install Modal Web
    cd $SDK_INSTALL_MODAL_WEB_DIR
    yarn build
fi

echo "########### START REPLACING SDK_COMMUNICATION_LAYER #########"

cd $DAPP_DIR
echo "Hack Metamask sdk && sdk-communication-layer packages..."

# Clean up old directories first
rm -rf node_modules/@metamask/sdk-communication-layer/dist
rm -rf node_modules/@metamask/sdk/dist
rm -rf node_modules/@metamask/sdk-react/dist
rm -rf node_modules/@metamask/sdk-install-modal-web/dist

# Ensure directories exist
mkdir -p node_modules/@metamask/sdk-communication-layer/dist
mkdir -p node_modules/@metamask/sdk/dist
mkdir -p node_modules/@metamask/sdk-react/dist
mkdir -p node_modules/@metamask/sdk-install-modal-web/dist

# Copy files
cp -rf $COMM_LAYER_DIR/dist/* node_modules/@metamask/sdk-communication-layer/dist/
cp -rf $SDK_DIR/dist/* node_modules/@metamask/sdk/dist/
cp -rf $SDK_DIR/package.json node_modules/@metamask/sdk/
# Fix the workspace reference in package.json (syntax varies by OS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' 's/"workspace:\*"/"*"/g' node_modules/@metamask/sdk/package.json
else
    # Linux
    sed -i 's/"workspace:\*"/"*"/g' node_modules/@metamask/sdk/package.json
fi

# # Install dependencies after fixing workspace references
# cd node_modules/@metamask/sdk && yarn install && cd ../../..

cp -rf $SDK_REACT_DIR/dist/* node_modules/@metamask/sdk-react/dist/
cp -rf $SDK_INSTALL_MODAL_WEB_DIR/dist/* node_modules/@metamask/sdk-install-modal-web/dist/

# Remove vite cache
rm -rf node_modules/.vite

echo "All done. You can now run yarn dev"
