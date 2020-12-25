#!/bin/sh

git submodule init
git submodule update

sed -i 's/platforms\(\".*\)/platforms\(\"darwin\/amd64\"\)/g' imgdiff/scripts/build.sh

./imgdiff/scripts/build.sh