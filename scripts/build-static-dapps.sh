#!/bin/bash

# Stop on first error
set -e

# Make sure to start from base workspace folder
reldir="$( dirname -- "$0"; )";
cd "$reldir/..";

# Function to get the deployment folder name
get_deployment_folder() {
    local package_json_path="./package.json"
    
    if [ "$IS_RELEASE" = "true" ]; then
        echo $(grep '"version":' "$package_json_path" | sed -E 's/.*"version": "([^"]+)".*/\1/')
    else
        local branch_name=""
        
        # Send debug messages to stderr instead of stdout
        >&2 echo "Debug: GITHUB_HEAD_REF = $GITHUB_HEAD_REF"
        >&2 echo "Debug: GITHUB_REF = $GITHUB_REF"
        >&2 echo "Debug: GITHUB_REF_NAME = $GITHUB_REF_NAME"
        
        if [ -n "$GITHUB_HEAD_REF" ]; then
            # We're in a pull request
            branch_name=$GITHUB_HEAD_REF
        elif [ -n "$GITHUB_REF_NAME" ]; then
            # We're in a push event or other workflow
            branch_name=$GITHUB_REF_NAME
        elif [ -n "$GITHUB_REF" ]; then
            # Fallback to GITHUB_REF if GITHUB_REF_NAME is not set
            branch_name=${GITHUB_REF#refs/heads/}
        else
            # Last resort: use git command
            branch_name=$(git rev-parse --abbrev-ref HEAD)
            if [ "$branch_name" = "HEAD" ]; then
                >&2 echo "Error: Unable to determine branch name"
                exit 1
            fi
        fi

        >&2 echo "Debug: Determined branch_name = $branch_name"

        # Only output the final result to stdout
        echo "$branch_name" | sed 's/\//-/g'
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
    echo "Build completed for $project_name"

    cd -  # Return to the root directory
}

# Function to build and consolidate all projects (placeholder)
build_and_consolidate() {
    echo "Starting build process..."

    if [ "$IS_RELEASE" != "true" ]; then
        yarn build # first build all workspace dependencies
    fi

    # Build projects
    build_project "packages/examples/react-demo"
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
    mkdir -p $deployment_dir/packages/examples/react-demo/build
    mkdir -p $deployment_dir/packages/examples/vuejs/build
    mkdir -p $deployment_dir/packages/examples/pure-javascript/
    mkdir -p $deployment_dir/packages/examples/with-web3onboard/build
    mkdir -p $deployment_dir/packages/examples/wagmi-demo-react/build # Create the new directory for wagmi-demo-react

    # Copy build outputs to deployments
    cp -rf packages/examples/react-demo/build/* $deployment_dir/packages/examples/react-demo/build/
    cp -rf packages/examples/vuejs/build/* $deployment_dir/packages/examples/vuejs/build/
    cp -rf packages/examples/with-web3onboard/build/* $deployment_dir/packages/examples/with-web3onboard/build/
    cp -rf packages/examples/wagmi-demo-react/build/* $deployment_dir/packages/examples/wagmi-demo-react/build/  # Copy build output for the new project
    cp -rf packages/examples/pure-javascript/* $deployment_dir/packages/examples/pure-javascript/
}

# Function to update index.html inside the deployment folder
update_index_html() {
    local deployment_dir=$1
    local branch_name=$2
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
    <h3>$branch_name</h3>
    <ul>" > "$deployment_dir/index.html"

    # List all directories in the deployment directory, excluding index.html itself
    for dir in "$deployment_dir"/*/; do
        dir=${dir%*/}  # Remove trailing slash
        dir_name=${dir##*/}  # Extract directory name
        if [ "$dir_name" != "index.html" ]; then
            if [ "$dir_name" = "pure-javascript" ]; then
                echo "        <li><a href=\"$dir_name/index.html\">$dir_name</a></li>" >> "$deployment_dir/index.html"
            else
                echo "        <li><a href=\"$dir_name/build/index.html\">$dir_name</a></li>" >> "$deployment_dir/index.html"
            fi
        fi
    done

    echo "    </ul>
</body>
</html>" >> "$deployment_dir/index.html"

    echo "Updated index.html in $deployment_dir"
}

# Create an index.html file with links to all deployment folders
create_index_html() {
    local existing_folders="$1"
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

    # List all directories in existing_folders, excluding index.html itself
    for dir in $existing_folders; do
        if [ "$dir" != "index.html" ]; then
            echo "        <li><a href=\"$dir/packages/examples/index.html\">$dir</a></li>" >> deployments/index.html
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
update_index_html "$deployment_dir/packages/examples" "$deployment_folder" 

# Fetch the existing folders on the "gh-pages" branch and keep them as a list
existing_folders=$(git ls-tree -d --name-only origin/gh-pages)

echo "Existing folders on gh-pages branch:"
echo "$existing_folders"

if [[ ! "$existing_folders" =~ "$deployment_folder" ]]; then
    existing_folders="$existing_folders $deployment_folder"
fi

# Update root index.html to point to the latest deployment
echo "Updating root index.html"
create_index_html "$existing_folders"

echo "Deployment process completed! You can check it out here: https://metamask.github.io/metamask-sdk/$deployment_folder"
