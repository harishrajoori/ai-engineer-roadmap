#!/usr/bin/env bash
cd "$(dirname "$0")"
PORT=8765
echo "Serving AI Systems Engineer 2027 Hub on http://127.0.0.1:$PORT ..."
python3 -m http.server $PORT
