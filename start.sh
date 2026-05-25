#!/bin/bash
# Startup script for Orange Pi / ARM64
export NODE_ENV=production
export PORT=${PORT:-3000}

# Set low memory Node.js flags for Orange Pi
exec node \
  --max-old-space-size=256 \
  --optimize-for-size \
  server/server.js
