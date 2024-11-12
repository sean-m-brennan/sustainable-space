#!/bin/sh
set +x  # debugging: off

if [ "${FRONTEND}x" = "x" ]; then  # i.e. excluded if FRONTEND specified
  # Generate spice data
  PYTHONPATH=src/app python -m api
fi
if [ "${BACKEND}x" = "x" ]; then  # i.e. excluded if BACKEND specified
  # Generate typescript code
  python packages/locate-user/tz/ingest_table.py
fi
