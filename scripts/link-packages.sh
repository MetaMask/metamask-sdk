#!/usr/bin/env bash
cd ./packages

packages=("sdk" "sdk-communication-layer" "sdk-react" "sdk-install-modal-web")
for name in "${packages[@]}"
do
  cd $name
  # We swallow the output of "yarn unlink" because we don't care if it fails
  ! yarn unlink &> /dev/null
  yarn link
  cd ..
done
