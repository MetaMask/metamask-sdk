#!/bin/sh

reldir="$( dirname -- "$0"; )";
# force change to base workspace folder
cd "$reldir";

sed -i '' '10i\
#include <functional>
' ios/Pods/Flipper/xplat/Flipper/FlipperTransportTypes.h
