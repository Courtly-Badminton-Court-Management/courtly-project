FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev netcat-openbsd ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && update-ca-certificates

WORKDIR /app

COPY requirements.txt /app/requirements.txt
RUN pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org --no-cache-dir -r requirements.txt

COPY . /app

RUN printf '%s\n' '#!/usr/bin/env sh' \
  'set -e' \
  'host="db"; port="${POSTGRES_PORT:-5432}"' \
  'until nc -z "$host" "$port"; do echo "Waiting for $host:$port..."; sleep 1; done' \
  'echo "DB is reachable."' \
  > /usr/local/bin/wait_for_db && chmod +x /usr/local/bin/wait_for_db

EXPOSE 8000
