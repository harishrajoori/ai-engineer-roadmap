#!/usr/bin/env bash
cd "$(dirname "$0")"
PORT=8765
echo "Starting AI Systems Engineer Hub (React + Vite) on http://localhost:$PORT ..."
npx vite --port $PORT --host
