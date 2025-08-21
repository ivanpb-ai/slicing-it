#!/bin/bash

# Start the dev server in the background
npm run dev > npm_output.log 2>&1 &
SERVER_PID=$!

# Wait for the server to be ready
echo "Waiting for dev server to be ready..."
while ! grep -q "Local:" npm_output.log; do
  # If the server process has died, exit
  if ! ps -p $SERVER_PID > /dev/null; then
    echo "Dev server failed to start. Check npm_output.log"
    exit 1
  fi
  sleep 1
done

# Get the URL from the log file
URL=$(grep "Local:" npm_output.log | tail -n 1 | awk '{print $3}')
echo "Server is ready at $URL"

# Run the Playwright script
python jules-scratch/verification/verify_layout.py "$URL"

# Kill the server
kill $SERVER_PID
