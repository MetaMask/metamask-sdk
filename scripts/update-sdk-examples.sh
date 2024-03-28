#!/bin/bash

# Gets arg1: dependency name; arg2: path to example
update_dependency_versions() {
    local dependency=$1
    local version=$2
    local example_path=$3
    local cwd=$(pwd)

    cd $example_path

    local current_version=$( cat package.json | jq -r '.dependencies["'"$dependency"'"]' | sed 's/\^//' )

    if [ "$current_version" != "$version" ]; then
      jq --arg dep "$dependency" --arg ver "^$version" '.dependencies[$dep] = $ver' package.json > temp.json && mv temp.json package.json
    fi

    yarn dedupe

    git add package.json yarn.lock

    cd $cwd
}


# Function to push changes and create a pull request
create_pull_request() {
    local branch_name=$1
    local latest_release=$2
    local base_branch="main"
    local pr_title="[Dapps] Update examples to latest version of MMSDK ($latest_release)"
    local pr_body="This pull request updates the MMSDK version on all examples to the latest release ($latest_release)."

    git push --set-upstream origin "${branch_name}"

    git push origin $branch_name
    gh pr create --base $base_branch --title "$pr_title" --body "$pr_body"
}

# Start
git checkout -b $branch_name
git config user.name metamaskbot
git config user.email metamaskbot@users.noreply.github.com

mmsdk_react="@metamask/sdk-react"
latest_sdk_react_version=$(yarn npm info $mmsdk_react --fields version --json | jq -r '.version')
sdk_react_examples=(
    'packages/examples/create-react-app'
    'packages/examples/nextjs-demo'
    'packages/examples/expo-demo'
    'packages/examples/react-with-custom-modal'
    'packages/examples/reactNativeDemo'
)

mmsdk="@metamask/sdk"
latest_sdk_version=$(yarn npm info $mmsdk --fields version --json | jq -r '.version')
sdk_examples=(
    'packages/examples/electronjs'
    'packages/examples/nodejs'
    'packages/examples/pure-javascript'
    'packages/examples/vuejs'
)

mmsdk_react_ui='@metamask/sdk-react-ui'
latest_sdk_react_ui_version=$(yarn npm info $mmsdk_react_ui --fields version --json | jq -r '.version')
sdk_react_ui_examples=(
    'packages/examples/react-metamask-button'
)

mmsdk_web3_onboard='@web3-onboard/metamask'
latest_sdk_web3_onboard_version=$(yarn npm info $mmsdk_web3_onboard --fields version --json | jq -r '.version')
sdk_web3_onboard_examples=(
    'packages/examples/with-web3onboard'
)

for example_dapp in "${sdk_react_examples[@]}"
do
    update_dependency_versions $mmsdk_react $latest_sdk_react_version $example_dapp
done

for example_dapp in "${sdk_examples[@]}"
do
    update_dependency_versions $mmsdk $latest_sdk_version $example_dapp
done

for example_dapp in "${sdk_react_ui_examples[@]}"
do
    update_dependency_versions $mmsdk_react_ui $latest_sdk_react_ui_version $example_dapp
done

for example_dapp in "${sdk_web3_onboard_examples[@]}"
do
    update_dependency_versions $mmsdk_web3_onboard $latest_sdk_web3_onboard_version $example_dapp
done

# Get the latest release and set the branch name to avoid duplicates
latest_release=$( git log --format=%s | grep -m 1 "^Release [0-9]\+\.[0-9]\+\.[0-9]\+" | awk '{print $2}' )
branch_name="chore/update-dapps-$latest_release"

echo "version: $latest_release"
echo "branch: $branch_name"

git commit -m "chore: Updates example dependencies"

create_pull_request $branch_name $latest_release
