#!/bin/bash

# Ensure the script starts from the base workspace folder
reldir="$( dirname -- "$0"; )"
cd "$reldir/.."
SDK_WORKSPACE_DIR="$( pwd; )"

# Define package directories
COMM_LAYER_DIR="$SDK_WORKSPACE_DIR/packages/sdk-communication-layer"
SDK_DIR="$SDK_WORKSPACE_DIR/packages/sdk"
SDK_REACT_DIR="$SDK_WORKSPACE_DIR/packages/sdk-react"
SDK_REACT_UI_DIR="$SDK_WORKSPACE_DIR/packages/sdk-react-ui"
SDK_REACT_NATIVE_DIR="$SDK_WORKSPACE_DIR/packages/sdk-react-native"

# Function to get the version from package.json
get_version() {
  if [ -f "$1" ]; then
    jq -r '.version' "$1"
  else
    echo "Error: Could not find $1"
    exit 1
  fi
}

# Get the latest versions of the packages
sdk_version=$(get_version "$SDK_DIR/package.json")
sdk_react_version=$(get_version "$SDK_REACT_DIR/package.json")
sdk_react_ui_version=$(get_version "$SDK_REACT_UI_DIR/package.json")
sdk_react_native_version=$(get_version "$SDK_REACT_NATIVE_DIR/package.json")

echo "Latest versions:"
echo "@metamask/sdk: $sdk_version"
echo "@metamask/sdk-react: $sdk_react_version"
echo "@metamask/sdk-react-ui: $sdk_react_ui_version"
echo "@metamask/sdk-react-native: $sdk_react_native_version"

# Define the path to the examples folder
EXAMPLES_DIR="$SDK_WORKSPACE_DIR/packages/examples"

# Loop through each example app
for app in "$EXAMPLES_DIR"/*; do
  if [ -d "$app" ]; then
    echo "Checking app: $app"
    PACKAGE_JSON="$app/package.json"
    if [ -f "$PACKAGE_JSON" ]; then
      echo "Found package.json in $app"

      # Check and update sdk
      current_version=$(jq -r '.dependencies["@metamask/sdk"]' "$PACKAGE_JSON")
      latest_version="^$sdk_version"
      echo "Current @metamask/sdk version in $app: $current_version"
      if [[ "$current_version" != "null" && "$current_version" != "$latest_version" ]]; then
        echo "Updating @metamask/sdk in $app from $current_version to $latest_version"

        # using yarn instead to allow upgrading to happen on ci
        yarn up @metamask/sdk
        # jq '.dependencies["@metamask/sdk"] = "'"$latest_version"'"' "$PACKAGE_JSON" > "$PACKAGE_JSON.tmp" && mv "$PACKAGE_JSON.tmp" "$PACKAGE_JSON"
      fi

      # Check and update sdk-react
      current_version=$(jq -r '.dependencies["@metamask/sdk-react"]' "$PACKAGE_JSON")
      latest_version="^$sdk_react_version"
      echo "Current @metamask/sdk-react version in $app: $current_version"
      if [[ "$current_version" != "null" && "$current_version" != "$latest_version" ]]; then
        echo "Updating @metamask/sdk-react in $app from $current_version to $latest_version"

        # using yarn instead to allow upgrading to happen on ci
        yarn up @metamask/sdk-react
        # jq '.dependencies["@metamask/sdk-react"] = "'"$latest_version"'"' "$PACKAGE_JSON" > "$PACKAGE_JSON.tmp" && mv "$PACKAGE_JSON.tmp" "$PACKAGE_JSON"
      fi

      # Check and update sdk-react-ui
      current_version=$(jq -r '.dependencies["@metamask/sdk-react-ui"]' "$PACKAGE_JSON")
      latest_version="^$sdk_react_ui_version"
      echo "Current @metamask/sdk-react-ui version in $app: $current_version"
      if [[ "$current_version" != "null" && "$current_version" != "$latest_version" ]]; then
        echo "Updating @metamask/sdk-react-ui in $app from $current_version to $latest_version"

        # using yarn instead to allow upgrading to happen on ci
        yarn up @metamask/sdk-react-ui
        # jq '.dependencies["@metamask/sdk-react-ui"] = "'"$latest_version"'"' "$PACKAGE_JSON" > "$PACKAGE_JSON.tmp" && mv "$PACKAGE_JSON.tmp" "$PACKAGE_JSON"
      fi

      # Check and update sdk-react-native
      current_version=$(jq -r '.dependencies["@metamask/sdk-react-native"]' "$PACKAGE_JSON")
      latest_version="^$sdk_react_native_version"
      echo "Current @metamask/sdk-react-native version in $app: $current_version"
      if [[ "$current_version" != "null" && "$current_version" != "$latest_version" ]]; then
        echo "Updating @metamask/sdk-react-native in $app from $current_version to $latest_version"

        # using yarn instead to allow upgrading to happen on ci
        yarn up @metamask/sdk-react-native
        # jq '.dependencies["@metamask/sdk-react-native"] = "'"$latest_version"'"' "$PACKAGE_JSON" > "$PACKAGE_JSON.tmp" && mv "$PACKAGE_JSON.tmp" "$PACKAGE_JSON"
      fi

    else
      echo "No package.json found in $app"
    fi
  else
    echo "$app is not a directory"
  fi
done

echo "All packages are updated to their latest versions and dependencies installed."
