#!/bin/bash
# Helper script to load environment variables

set -a
source .env
set +a

echo "✅ Environment variables loaded"
echo "   Database: $POSTGRES_DB"
echo "   Backend Port: $BACKEND_PORT"
echo "   AI Worker Port: $AI_WORKER_PORT"
