#!/bin/bash
set -e
echo "=== Clearing stale node_modules ==="
rm -rf node_modules
echo "=== Fresh install ==="
npm install --legacy-peer-deps
echo "=== Build complete ==="
