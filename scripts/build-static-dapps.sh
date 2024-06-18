#!/bin/bash

# Echo commands to the terminal output
# set -x

# stop on first error
# set -e

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

# Function to build and consolidate all projects
build_and_consolidate() {
    echo "Starting build process..."

    yarn build # first build all workspace dependencies

    # Build projects
    build_project "deployments/dapps/sdk-playground"
    build_project "packages/examples/create-react-app"
    build_project "packages/examples/vuejs"

    # Special handling for Pure JS Example
    echo "Handling Pure JS Example..."
    cd packages/examples/pure-javascript
    yarn install
    cd -

    # Continue building other projects
    build_project "packages/examples/react-metamask-button"
    build_project "packages/examples/react-with-custom-modal"
    build_project "packages/examples/with-web3onboard"

    echo "Building Storybook Static..."
    yarn workspace @metamask/sdk-ui build:storybook # then build storybook

    # Combine Deployments
    echo "Combining deployments..."
    # Create necessary directories in deployments
    mkdir -p $deployment_dir/packages/examples/create-react-app/build
    mkdir -p $deployment_dir/dapps/sdk-playground/build
    mkdir -p $deployment_dir/packages/examples/vuejs/dist
    mkdir -p $deployment_dir/packages/examples/pure-javascript
    mkdir -p $deployment_dir/packages/examples/react-metamask-button/build
    mkdir -p $deployment_dir/packages/examples/react-with-custom-modal/build
    mkdir -p $deployment_dir/packages/examples/with-web3onboard/dist
    mkdir -p $deployment_dir/packages/sdk-ui/storybook-static

    # Copy build outputs to deployments
    cp -r packages/examples/create-react-app/build/* $deployment_dir/packages/examples/create-react-app/build/
    cp -r packages/examples/vuejs/dist/* $deployment_dir/packages/examples/vuejs/dist/
    cp -r packages/examples/react-metamask-button/build/* $deployment_dir/packages/examples/react-metamask-button/build/
    cp -r packages/examples/react-with-custom-modal/build/* $deployment_dir/packages/examples/react-with-custom-modal/build/
    cp -r packages/examples/with-web3onboard/dist/* $deployment_dir/packages/examples/with-web3onboard/dist/
    cp -r deployments/dapps/sdk-playground/build/* $deployment_dir/dapps/sdk-playground/build/
    cp -r packages/sdk-ui/storybook-static/* $deployment_dir/packages/sdk-ui/storybook-static/

    # Special handling for pure_javascript
    cp -r packages/examples/pure-javascript/* $deployment_dir/packages/examples/pure-javascript/
}

update_index_html() {
    deployment_dir=$1

    cp templates/index.html "$deployment_dir/index.html"
    cp templates/version_info_placeholder.html "$deployment_dir/version_info.html"

    # Cross-platform compatible sed command
    if [[ "$(uname)" == "Darwin" ]]; then
        echo "macOS detected. Using sed -i ''"
        sed -i '' "s/RELEASE_VERSION_PLACEHOLDER/$version/g" "$deployment_dir/version_info.html"
        sed -i '' "s/SDK_VERSION_PLACEHOLDER/$sdkVersion/g" "$deployment_dir/version_info.html"
        sed -i '' "s/SDK_COMM_LAYER_VERSION_PLACEHOLDER/$sdkCommLayerVersion/g" "$deployment_dir/version_info.html"
        sed -i '' "s/SDK_REACT_VERSION_PLACEHOLDER/$sdkReactVersion/g" "$deployment_dir/version_info.html"
        sed -i '' "s/SDK_UI_VERSION_PLACEHOLDER/$sdkUiVersion/g" "$deployment_dir/version_info.html"
        sed -i '' "s/SDK_REACT_UI_VERSION_PLACEHOLDER/$sdkReactUiVersion/g" "$deployment_dir/version_info.html"
        sed -i '' "s/SDK_INSTALL_MODAL_WEB_VERSION_PLACEHOLDER/$sdkInstallModalWebVersion/g" "$deployment_dir/version_info.html"
    else
        # Linux does not require the empty string argument
        echo "Linux detected. Using sed -i"
        sed -i "s/RELEASE_VERSION_PLACEHOLDER/$version/g" "$deployment_dir/version_info.html"
        sed -i "s/SDK_VERSION_PLACEHOLDER/$sdkVersion/g" "$deployment_dir/version_info.html"
        sed -i "s/SDK_COMM_LAYER_VERSION_PLACEHOLDER/$sdkCommLayerVersion/g" "$deployment_dir/version_info.html"
        sed -i "s/SDK_REACT_VERSION_PLACEHOLDER/$sdkReactVersion/g" "$deployment_dir/version_info.html"
        sed -i "s/SDK_UI_VERSION_PLACEHOLDER/$sdkUiVersion/g" "$deployment_dir/version_info.html"
        sed -i "s/SDK_REACT_UI_VERSION_PLACEHOLDER/$sdkReactUiVersion/g" "$deployment_dir/version_info.html"
        sed -i "s/SDK_INSTALL_MODAL_WEB_VERSION_PLACEHOLDER/$sdkInstallModalWebVersion/g" "$deployment_dir/version_info.html"
    fi

    # Replace the placeholder in index.html with the contents of the version_info file
    if [[ "$(uname)" == "Darwin" ]]; then
        sed -i '' "/<!-- REPLACE_SDK_INFO_HEADER -->/{
            r $deployment_dir/version_info.html
            d
        }" "$deployment_dir/index.html"
    else
        sed -i "/<!-- REPLACE_SDK_INFO_HEADER -->/{
            r $deployment_dir/version_info.html
            d
        }" "$deployment_dir/index.html"
    fi

    rm "$deployment_dir/version_info.html"
    # Last pass to make sure to replae RELEASE_VERSION_PLACEHOLDER with the actual version
    if [[ "$(uname)" == "Darwin" ]]; then
        sed -i '' "s/RELEASE_VERSION_PLACEHOLDER/$version/g" "$deployment_dir/index.html"
    else
        sed -i "s/RELEASE_VERSION_PLACEHOLDER/$version/g" "$deployment_dir/index.html"
    fi

    cp "$deployment_dir/index.html" "$deployment_dir/release.html"

    echo "Updated index.html with SDK version info."
}

# Function to extract version from a specified package.json file
get_version() {
    package_json_path=$1  # Path to the package.json file
    echo $(grep '"version":' "$package_json_path" | sed -E 's/.*"version": "([^"]+)".*/\1/')
}

# Extract version
version=$(get_version "./package.json")
sdkVersion=$(get_version "./packages/sdk/package.json")
sdkCommLayerVersion=$(get_version "./packages/sdk-communication-layer/package.json")
sdkReactVersion=$(get_version "./packages/sdk-react/package.json")
sdkUiVersion=$(get_version "./packages/sdk-ui/package.json")
sdkReactUiVersion=$(get_version "./packages/sdk-react-ui/package.json")
sdkInstallModalWebVersion=$(get_version "./packages/sdk-install-modal-web/package.json")
deployment_dir="deployments/$version"

# Main build script
echo "Deployment directory: $deployment_dir"
echo "Starting build process..."

echo "Main Monorepo Release version: $version"
echo "SDK version: $sdkVersion"
echo "SDK Communication Layer version: $sdkCommLayerVersion"
echo "SDK React version: $sdkReactVersion"
echo "SDK UI version: $sdkUiVersion"
echo "SDK React UI version: $sdkReactUiVersion"
echo "SDK Install Modal Web version: $sdkInstallModalWebVersion"

# Main script execution
build_and_consolidate
update_index_html "$deployment_dir"

echo "Creating index.html in the root directory..."
# use html meta tag to redirect to the latest release

echo "<meta http-equiv=\"refresh\" content=\"0; url=\"$version/index.html\">" > deployments/index.html
# print content from index.html for debugging
cat index.html

echo "Deployment directory ready!"

