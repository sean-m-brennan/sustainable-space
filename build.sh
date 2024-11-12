#!/bin/sh
set -x  # debugging
env

if [ -n "${FRONTEND+x}" ]; then  # i.e. excluded if FRONTEND specified
  # Generate spice data
  PYTHONPATH=src/app python -m api
fi
if [ -n "${BACKEND+x}" ]; then  # i.e. excluded if BACKEND specified
  # Generate typescript code
  python src/frontend/browser/tz/ingest_table.py
fi
