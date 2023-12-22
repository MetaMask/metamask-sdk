#!/bin/bash

# Echo commands to the terminal output
set -x

# stop on first error
set -e

# Make sure to start from base workspace folder
reldir="$( dirname -- "$0"; )";
cd "$reldir/..";

# Function to build a specific project
build_project() {
    project_path=$1
    project_name=$(basename $project_path)

    echo "Building $project_name..."

    cd $project_path
    yarn install
    yarn build
    cd -  # Return to the root directory
}

# Main build script

echo "Starting build process..."

# Build Playground React App
build_project "deployments/dapps/sdk-playground"

# Build CRA Example
build_project "packages/examples/create-react-app"

# Build Vue JS Example
build_project "packages/examples/vuejs"

# Build Pure JS Example
# Special case: No build step, but ensure dependencies are installed
echo "Handling Pure JS Example..."
cd packages/examples/pure-javascript
yarn install
cd -

# Build React MetaMask Button
build_project "packages/examples/react-metamask-button"

# Build React Custom Modal
build_project "packages/examples/react-with-custom-modal"

# Build Web3 Onboard
build_project "packages/examples/with-web3onboard"

# Build Storybook Static
echo "Building Storybook Static..."
yarn workspace @metamask/sdk-ui build:storybook

echo "All builds completed successfully!"

# Combine Deployments
echo "Combining deployments..."

# Create necessary directories in deployments
mkdir -p deployments/packages/examples/create-react-app/build
mkdir -p deployments/packages/examples/vuejs/dist
mkdir -p deployments/packages/examples/pure-javascript
mkdir -p deployments/packages/examples/react-metamask-button/build
mkdir -p deployments/packages/examples/react-with-custom-modal/build
mkdir -p deployments/packages/examples/with-web3onboard/dist
mkdir -p deployments/packages/sdk-ui/storybook-static

# Copy build outputs to deployments
cp -r packages/examples/create-react-app/build/* deployments/packages/examples/create-react-app/build/
cp -r packages/examples/vuejs/dist/* deployments/packages/examples/vuejs/dist/
cp -r packages/examples/react-metamask-button/build/* deployments/packages/examples/react-metamask-button/build/
cp -r packages/examples/react-with-custom-modal/build/* deployments/packages/examples/react-with-custom-modal/build/
cp -r packages/examples/with-web3onboard/dist/* deployments/packages/examples/with-web3onboard/dist/
cp -r packages/sdk-ui/storybook-static/* deployments/packages/sdk-ui/storybook-static/

# Special handling for pure_javascript
cp -r packages/examples/pure-javascript/* deployments/packages/examples/pure-javascript/

echo "Deployment directory ready!"
