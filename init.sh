#!/bin/sh

git submodule init
git submodule update
cd imgdiff
sed -i 's/platforms(.*)/platforms("darwin/amd64")/' scripts/build.sh
./scripts/build.sh

cd ..