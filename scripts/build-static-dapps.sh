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
    
    if [ "$current_branch" = "main" ]; then
        echo "main"
    elif [ "$IS_RELEASE" = "true" ]; then
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
    yarn build
    cd -  # Return to the root directory
}

# Function to build and consolidate all projects (placeholder)
build_and_consolidate() {
    echo "Starting build process..."

    yarn build # first build all workspace dependencies

    # Build projects
    # build_project "deployments/dapps/sdk-playground"
    build_project "packages/examples/create-react-app"
    # build_project "packages/examples/vuejs"
    # build_project "packages/examples/wagmi-demo-react"  

    # Special handling for Pure JS Example
    # echo "Handling Pure JS Example..."
    # cd packages/examples/pure-javascript
    # yarn install
    # cd -

    # Continue building other projects
    # build_project "packages/examples/react-metamask-button"
    # build_project "packages/examples/react-with-custom-modal"
    # build_project "packages/examples/with-web3onboard"

    # echo "Building Storybook Static..."
    # yarn workspace @metamask/sdk-ui build:storybook # then build storybook

    # Combine Deployments
    echo "Combining deployments..."
    # Create necessary directories in deployments
    mkdir -p $deployment_dir/packages/examples/create-react-app/build
    # mkdir -p $deployment_dir/dapps/sdk-playground/build
    # mkdir -p $deployment_dir/packages/examples/vuejs/dist
    # mkdir -p $deployment_dir/packages/examples/pure-javascript
    # mkdir -p $deployment_dir/packages/examples/react-metamask-button/build
    # mkdir -p $deployment_dir/packages/examples/react-with-custom-modal/build
    # mkdir -p $deployment_dir/packages/examples/with-web3onboard/dist
    # mkdir -p $deployment_dir/packages/sdk-ui/storybook-static
    # mkdir -p $deployment_dir/packages/examples/wagmi-demo-react/dist # Create the new directory for wagmi-demo-react

    # Copy build outputs to deployments
    cp -r packages/examples/create-react-app/build/* $deployment_dir/packages/examples/create-react-app/build/
    # cp -r packages/examples/vuejs/dist/* $deployment_dir/packages/examples/vuejs/dist/
    # cp -r packages/examples/react-metamask-button/build/* $deployment_dir/packages/examples/react-metamask-button/build/
    # cp -r packages/examples/react-with-custom-modal/build/* $deployment_dir/packages/examples/react-with-custom-modal/build/
    # cp -r packages/examples/with-web3onboard/dist/* $deployment_dir/packages/examples/with-web3onboard/dist/
    # cp -r deployments/dapps/sdk-playground/build/* $deployment_dir/dapps/sdk-playground/build/
    # cp -r packages/sdk-ui/storybook-static/* $deployment_dir/packages/sdk-ui/storybook-static/
    # cp -r packages/examples/wagmi-demo-react/dist/* $deployment_dir/packages/examples/wagmi-demo-react/dist/  # Copy build output for the new project
    # cp -r packages/examples/pure-javascript/* $deployment_dir/packages/examples/pure-javascript/
}

# Function to update index.html (placeholder)
update_index_html() {
    local deployment_dir=$1
    echo "Updating index.html in $deployment_dir"
    # Your existing index.html update logic goes here
    # ...
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
        h1 { color: #1098fc; }
        ul { list-style-type: none; padding: 0; }
        li { margin-bottom: 10px; }
        a { color: #1098fc; text-decoration: none; }
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
            echo "        <li><a href=\"$dir_name/index.html\">$dir_name</a></li>" >> deployments/index.html
        fi
    done

    echo "    </ul>
</body>
</html>" >> deployments/index.html

    echo "Created index.html with list of deployment folders"
}


# Main script
echo "Starting deployment process..."

# Determine the deployment folder
deployment_folder=$(get_deployment_folder)
deployment_dir="deployments/$deployment_folder"

echo "Deployment folder: $deployment_folder"
echo "Deployment directory: $deployment_dir"

# Create deployment directory
mkdir -p "$deployment_dir"

# Build and consolidate projects
build_and_consolidate

# Copy built files to deployment directory
echo "Copying built files to $deployment_dir"
# Replace these with your actual build output directories
cp -r deployments/dapps/sdk-playground/build/* "$deployment_dir/"
cp -r packages/examples/create-react-app/build/* "$deployment_dir/create-react-app/"
cp -r packages/examples/vuejs/dist/* "$deployment_dir/vuejs/"
# Add more cp commands for other apps as needed

# Update index.html
update_index_html "$deployment_dir"

# Handle special cases for main branch and production releases
if [ "$deployment_folder" = "main" ]; then
    echo "Deploying to main folder, replacing existing content"
    rm -rf deployments/main
    mv "$deployment_dir" deployments/main
elif [ "$IS_RELEASE" = "true" ]; then
    echo "Deploying to prod folder, replacing existing content"
    rm -rf deployments/prod
    mv "$deployment_dir" deployments/prod
    # Create a symlink or copy to the versioned folder
    version=$(grep '"version":' "./package.json" | sed -E 's/.*"version": "([^"]+)".*/\1/')
    ln -s deployments/prod "deployments/$version" || cp -r deployments/prod "deployments/$version"
fi

# Update root index.html to point to the latest deployment
echo "Updating root index.html"
create_index_html

echo "Deployment process completed!"
