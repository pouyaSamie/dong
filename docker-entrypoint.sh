#!/bin/sh
set -eu

# Kept for compatibility with older deployments. New runtime images invoke
# server.js directly and run migrations as an explicit deployment step.
exec node server.js
