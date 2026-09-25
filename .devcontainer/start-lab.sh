#!/usr/bin/env bash

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if [ ! -f .env ]; then
  echo "Creando configuración local para el Codespace..."

  umask 077

  PASSWORD="codespace_$(tr -d '-' < /proc/sys/kernel/random/uuid)"

  cat > .env <<EOF
POSTGRES_DB=libro
POSTGRES_USER=app
POSTGRES_PASSWORD=${PASSWORD}
EOF
fi

echo "Esperando al daemon de Docker..."

for ((i = 1; i <= 30; i++)); do
  if docker info >/dev/null 2>&1; then
    break
  fi

  sleep 1
done

if ! docker info >/dev/null 2>&1; then
  echo "Docker no estuvo disponible dentro del tiempo esperado."
  exit 1
fi

echo "Iniciando servicios del LAB-02..."

docker compose up -d --build --wait

docker compose ps

echo "LAB-02 listo en http://localhost:8080"