#!/bin/sh

# Symlink to private dependencies
dependencies="locate-user space-data-api"
cwd=$(pwd)
for dep in $dependencies; do
    cd ../$dep
    npm run build
    npm link
    cd $cwd
done
npm link $dependencies

# Fetch texture images
node src/images/download.node.js
