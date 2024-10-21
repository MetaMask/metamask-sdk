#!/bin/bash

# Stop on first error
set -e

# Make sure to start from base workspace folder
reldir="$( dirname -- "$0"; )";
cd "$reldir/..";

# Function to get the deployment folder name
get_deployment_folder() {
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    local package_json_path="./package.json"
    
    if [ "$IS_RELEASE" = "true" ]; then
        echo $(grep '"version":' "$package_json_path" | sed -E 's/.*"version": "([^"]+)".*/\1/')
    else
        # Replace slashes with hyphens in the branch name
        echo "$current_branch" | sed 's/\//-/g'
    fi
}

# Function to build a specific project
build_project() {
    project_path=$1
    project_name=$(basename $project_path)

    echo "Building $project_name..."

    cd $project_path
    yarn install
    
    ## replace with the correct path
    if [ "$IS_RELEASE" != "true" ]; then
        echo "Running sdk-copy.sh for development build..."
        sh sdk-copy.sh
    else
        echo "Skipping sdk-copy.sh for release build..."
    fi

    # hack package.json to appear on the connect modal

    yarn build
    echo "Build completed for $project_name"

    cd -  # Return to the root directory
}

# Function to build and consolidate all projects (placeholder)
build_and_consolidate() {
    echo "Starting build process..."

    yarn build # first build all workspace dependencies

    # Build projects
    build_project "packages/examples/create-react-app"
    build_project "packages/examples/vuejs"
    build_project "packages/examples/wagmi-demo-react"  

    # Special handling for Pure JS Example
    echo "Handling Pure JS Example..."
    cd packages/examples/pure-javascript
    yarn install
    cd -

    # Continue building other projects
    build_project "packages/examples/with-web3onboard"

    # Combine Deployments
    echo "Combining deployments..."
    # Create necessary directories in deployments
    mkdir -p $deployment_dir/packages/examples/create-react-app/build
    mkdir -p $deployment_dir/packages/examples/vuejs/build
    mkdir -p $deployment_dir/packages/examples/pure-javascript/
    mkdir -p $deployment_dir/packages/examples/with-web3onboard/build
    mkdir -p $deployment_dir/packages/examples/wagmi-demo-react/build # Create the new directory for wagmi-demo-react

    # Copy build outputs to deployments
    cp -rf packages/examples/create-react-app/build/* $deployment_dir/packages/examples/create-react-app/build/
    cp -r packages/examples/vuejs/build/* $deployment_dir/packages/examples/vuejs/build/
    cp -r packages/examples/with-web3onboard/build/* $deployment_dir/packages/examples/with-web3onboard/build/
    cp -r packages/examples/wagmi-demo-react/build/* $deployment_dir/packages/examples/wagmi-demo-react/build/  # Copy build output for the new project
    cp -r packages/examples/pure-javascript/* $deployment_dir/packages/examples/pure-javascript/
}

# Function to update index.html (placeholder)
update_index_html() {
    local deployment_dir=$1
    echo "Updating index.html in $deployment_dir"
    echo "<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>MetaMask SDK Deployment</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #f45c00; }
        ul { list-style-type: none; padding: 0; }
        li { margin-bottom: 10px; }
        a { color: #333333; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>MetaMask SDK Dapps</h1>
    <ul>" > "$deployment_dir/index.html"

    # List all directories in the deployment directory, excluding index.html itself
    for dir in "$deployment_dir"/*/; do
        dir=${dir%*/}  # Remove trailing slash
        dir_name=${dir##*/}  # Extract directory name
        # special case for pure-javascript that does not have a build folder
        if [ "$dir_name" != "index.html" && "$dir_name" != "pure-javascript" ]; then
            echo "        <li><a href=\"$dir_name/build/index.html\">$dir_name</a></li>" >> "$deployment_dir/index.html"
        fi
    done

    # special case for pure-javascript that does not have a build folder
    echo "        <li><a href=\"pure-javascript/index.html\">pure-javascript</a></li>" >> "$deployment_dir/index.html"

    echo "    </ul>
</body>
</html>" >> "$deployment_dir/index.html"

    echo "Updated index.html in $deployment_dir"
}

# Create an index.html file with links to all deployment folders
create_index_html() {
    echo "<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>MetaMask SDK Deployments</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #f45c00; }
        ul { list-style-type: none; padding: 0; }
        li { margin-bottom: 10px; }
        a { color: #333333; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>MetaMask SDK Deployments</h1>
    <ul>" > deployments/index.html

    # List all directories in gh-pages, excluding index.html itself
    for dir in deployments/*/; do
        dir=${dir%*/}  # Remove trailing slash
        dir_name=${dir##*/}  # Extract directory name
        if [ "$dir_name" != "index.html" ]; then
            echo "        <li><a href=\"$dir_name/packages/examples/index.html\">$dir_name</a></li>" >> deployments/index.html
        fi
    done

    echo "    </ul>
</body>
</html>" >> deployments/index.html

    echo "Created index.html with list of deployment folders"
}


# Main script
echo "Starting deployment process..."
echo "Using IS_RELEASE: $IS_RELEASE"

if [ "$IS_RELEASE" = "true" ]; then
    sh scripts/update-examples-dapps.sh
fi

# Determine the deployment folder - change this to detect if main or is_realease to hardcode folders
if [ "$IS_RELEASE" = "true" ]; then
    deployment_folder="prod"
else
    deployment_folder=$(get_deployment_folder)
fi

deployment_dir="deployments/$deployment_folder"

echo "Deployment folder: $deployment_folder"
echo "Deployment directory: $deployment_dir"

# Create deployment directory
mkdir -p "$deployment_dir"

# Build and consolidate projects
build_and_consolidate

# Copy built files to deployment directory
echo "Copying built files to $deployment_dir"

# Update index.html
update_index_html "$deployment_dir/packages/examples"


# Update root index.html to point to the latest deployment
echo "Updating root index.html"
create_index_html

echo "Deployment process completed! You can check it out here: https://metamask.github.io/sdk-dapps/$deployment_folder"
