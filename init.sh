#!/bin/sh

git submodule init
git submodule update

sed 's/platforms\=\(.*\)/platforms\=\(\"linux\/386\"\)/' -i imgdiff/scripts/build.sh 

cd imgdiff
./scripts/build.sh
cd ..