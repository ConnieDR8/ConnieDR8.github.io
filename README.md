# Perfil: Connie Yamile Durán Ramírez

Sitio personal publicado en https://ConnieDR8.github.io

## Cómo se publica

Cada push a `main` despliega automáticamente con GitHub Pages.

## Flujo de trabajo

- `main` protegida; todo cambio entra por pull request
- Una rama por cambio: `feature/*`, `fix/*`
- Mensajes de commit en imperativo, ≤ 50 caracteres

## Historial del curso

- **S02**: Sitio inicial, ramas y pull requests


## Bitácora de decisiones

### Reto 1: Imagen mínima

- **Decisión:**
  Implementé un Dockerfile multi-stage para la API con dos etapas: `dependencies` y `runtime`, usando `node:22.23.3-bookworm-slim`. La primera instala las dependencias y la segunda contiene solo lo necesario para ejecutar la aplicación.

- **Alternativas que evalué:**
  - **Slim:** buena compatibilidad con Node.js y menor tamaño que la imagen estándar.
  - **Alpine:** más pequeña, pero usa `musl` en lugar de `glibc`, lo que puede causar incompatibilidades con algunas dependencias.

- **Por qué elegí esta:**
  Elegí `bookworm-slim` porque ofrece un buen equilibrio entre tamaño, compatibilidad y facilidad de mantenimiento. Con multi-stage fue suficiente para superar ampliamente el objetivo del reto.

- **Fuentes consultadas:**
  - Docker Docs — Multi-stage builds.
  - Docker Official Image for Node.js.
  - Dive — análisis de capas de imágenes Docker.

- **Cómo lo verifiqué:**
  Comparé la imagen inicial y la optimizada:

  ```text
  perfil-api:naive       412 MB
  perfil-api:optimized    80.6 MB
  ```

  La imagen pasó de `412 MB` a `80.6 MB`, una reducción aproximada del **80.4 %**, por lo que pesa mucho menos de la mitad de la versión ingenua.

  Una segunda medición con `docker image inspect` mostró:

  ```text
  Naive: 1,569.60 MB
  Optimized: 317.11 MB
  Reducción: 79.80 %
  ```

  Comandos utilizados:

  ```bash
  docker images perfil-api:naive
  docker images perfil-api:optimized
  docker history --no-trunc perfil-api:optimized
  ```

  También comprobé que la imagen final no contiene `gcc`, `g++`, `make` ni `python3`, y que no conserva caché de npm ni listas de paquetes APT.

  Finalmente ejecuté:

  ```bash
  docker compose up -d --wait
  docker compose ps
  curl http://localhost:8080/api/health
  ```

  Los tres servicios quedaron `healthy` y la API continuó funcionando correctamente.

- **Qué no me funcionó:**
  La primera imagen de la API era demasiado grande: tenía `412 MB` de contenido. Además, al buscar la caché de npm intenté acceder a `/root` usando el usuario `node` y obtuve un error de permisos. Repetí únicamente esa inspección con `--user root` y confirmé que la imagen final no conservaba dicha caché.


### Reto 2: Arranque ordenado

- **Decisión:**
  Parte de este reto ya había sido implementada durante B3, porque el arranque automático en Codespaces necesitaba que los servicios estuvieran realmente listos antes de abrir la aplicación. Para ello se configuraron `healthcheck` en `db`, `api` y `web`, además de `depends_on` con `condition: service_healthy`.

- **Alternativas que evalué:**
  - Usar solo `depends_on`: simple, pero no espera a que el servicio esté realmente listo.
  - Usar `healthcheck` + `service_healthy`: permite controlar la disponibilidad real de cada servicio.

- **Por qué elegí esta:**
  Porque garantiza un arranque ordenado y permite que `docker compose up -d --wait` termine únicamente cuando los tres servicios estén saludables. Esta configuración además permitió que B3 funcionara correctamente en un Codespace nuevo.

- **Fuentes consultadas:**
  - Docker Docs — Compose `depends_on`.
  - Docker Docs — Healthchecks.
  - PostgreSQL — `pg_isready`.

- **Cómo lo verifiqué:**

  ```bash
  docker compose down
  docker compose up -d --wait
  docker compose ps
  ```

**Qué no me funcionó:**
La configuración inicial usaba únicamente depends_on, lo cual definía el orden de inicio pero no garantizaba que PostgreSQL estuviera listo para aceptar conexiones. Por eso se reemplazó por condition: service_healthy.
