#!/bin/sh

python src/frontend/browser/tz/ingest_table.py

docker build -t spice-service:latest .
docker run -p 8000:8000 -it --rm spice-service bash
