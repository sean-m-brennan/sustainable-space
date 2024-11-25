#!/bin/sh

# Symlink to private dependencies
dependencies="locate-user space-data-api space-sim"
cwd=$(pwd)
for dep in $dependencies; do
    cd ../packages/$dep
    npm run build
    npm link
    cd $cwd
done
npm link $dependencies
