#!/bin/sh
set -e

# Démarrer le service en fonction du mode spécifié
if [ "$RUN_MODE" = "worker" ]; then
  echo "Starting in worker mode..."
  exec node dist/worker.js
else
  echo "Starting in API mode..."
  exec node dist/server.js
fi