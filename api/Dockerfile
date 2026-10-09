# Etapa de dependencias.
FROM node:22.23.3-bookworm-slim AS dependencies

WORKDIR /app

# Copia primero el manifiesto para aprovechar la caché de Docker.
COPY package.json ./

RUN npm install --omit=dev

# Etapa final de ejecución.
FROM node:22.23.3-bookworm-slim AS runtime

WORKDIR /app

# Copia únicamente las dependencias necesarias para producción.
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules

# Copia únicamente el código necesario para ejecutar la API.
COPY --chown=node:node app.js ./

# npm solo se necesita durante la construcción, no en tiempo de ejecución.
RUN rm -rf /usr/local/lib/node_modules/npm \
    /usr/local/bin/npm \
    /usr/local/bin/npx

# Corrige vulnerabilidades criticas de perl-base detectadas por Trivy.
RUN apt-get update \
    && apt-get install -y --no-install-recommends perl-base=5.36.0-7+deb12u4 \
    && rm -rf /var/lib/apt/lists/*

USER node

EXPOSE 3000

CMD ["node", "app.js"]