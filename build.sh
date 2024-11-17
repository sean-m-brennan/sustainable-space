#!/bin/sh

# Generate typescript code
node packages/locate-user/tz/ingest_tz_table.node.js
# Fetch texture images
node packages/space-sim/images/download.node.js
