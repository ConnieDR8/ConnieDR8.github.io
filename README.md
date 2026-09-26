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


### Reto 3: Nadie es root

- **Decisión:**
  Este reto quedó parcialmente implementado durante B4, donde configuré los tres Dockerfiles para ejecutar sus servicios con usuarios sin privilegios: `nginx` en web, `node` en API y `postgres` en base de datos.

- **Alternativas que evalué:**
  - Ejecutar los contenedores como `root`: facilita ciertas operaciones, pero aumenta el impacto de una vulnerabilidad.
  - Utilizar usuarios sin privilegios: reduce permisos dentro del contenedor y mejora el aislamiento.

- **Por qué elegí esta:**
  Porque los servicios no necesitan privilegios de root durante su ejecución normal. La web utiliza nginx-unprivileged y escucha en el puerto `8080`, evitando depender del puerto privilegiado `80`.

- **Fuentes consultadas:**
  - NGINX Unprivileged Container Image.
  - Docker Docs — buenas prácticas para Dockerfiles.
  - PostgreSQL Official Docker Image.

- **Cómo lo verifiqué:**

  ```bash
  for s in web api db; do docker compose exec $s whoami; done
  nginx
  node
  postgres
  ```

- **Qué no me funcionó:**
Inicialmente PostgreSQL no declaraba explícitamente un usuario no privilegiado en su Dockerfile. Esto se corrigió durante B4 configurando USER postgres.

### Reto 4: Red segmentada

- **Decisión:**
  Separé los servicios en dos redes: `frontend` para `web` y `api`, y `backend` para `api` y `db`. La API es el único servicio conectado a ambas redes.

- **Alternativas que evalué:**
  - Una sola red para todos los servicios: más simple, pero permite que `web` pueda resolver directamente a `db`.
  - Dos redes segmentadas: limita la comunicación a los servicios que realmente la necesitan.

- **Por qué elegí esta:**
  Aplica el principio de mínimo privilegio. `web` solo necesita comunicarse con `api`, mientras que únicamente `api` necesita acceso a PostgreSQL.

- **Fuentes consultadas:**
  - Docker Docs — Networking in Compose.
  - Docker Docs — `ports` y redes definidas por el usuario.

- **Cómo lo verifiqué:**

  Verifiqué que `web` no puede resolver directamente a `db`:

  ```bash
  docker compose exec web getent hosts db
  ```
  El comando no devolvió ninguna dirección. Luego comprobé su código de salida:
  $LASTEXITCODE
  2

  Esto confirmó que web no puede resolver el nombre db.
  Después comprobé que api sí puede resolver a db:
  docker compose exec api getent hosts db
  ```bash
   Resultado:
   172.19.0.2      db
  ```
  Finalmente comprobé los puertos de los servicios:
  docker compose ps
  ```bash
  Resultado:
  NAME           IMAGE        SERVICE   STATUS                   PORTS
  perfil-api-1   perfil-api   api       Up (healthy)             3000/tcp
  perfil-db-1    perfil-db    db        Up (healthy)             5432/tcp
  perfil-web-1   perfil-web   web       Up (healthy)             0.0.0.0:8080->8080/tcp, [::]:8080->8080/tcp
  ```
  Con esto se comprobó que:
- web no puede resolver db.
- api sí puede resolver db.
- api y db utilizan únicamente puertos internos.
- solo web publica el puerto 8080 hacia el host.
- los tres servicios permanecen en estado healthy.
- Qué no me funcionó:
  Inicialmente los tres servicios utilizaban la red predeterminada de Docker Compose, por lo que web podía alcanzar directamente a db. La solución fue separar los servicios en las redes frontend y backend, dejando a api como único servicio conectado a ambas.


  ### Reto 5: Escaneo de vulnerabilidades

- **Decisión:**
  Analicé la imagen de la API con Docker Scout, debido a que ya tenía una cuenta creada a la mano. Detecté que varias vulnerabilidades HIGH provenían de paquetes incluidos con npm, aunque npm no es necesario para ejecutar la API. Por ello lo eliminé de la etapa final del Dockerfile.

- **Alternativas que evalué:**
  - Cambiar la imagen base de Node.js: Scout indicó que `node:22.23.3-bookworm-slim` ya estaba actualizada.
  - Eliminar herramientas innecesarias del runtime: permitió reducir vulnerabilidades sin cambiar la versión de Node.js.

- **Por qué elegí esta:**
  Porque npm solo se necesita durante la construcción. La API se ejecuta directamente con `node app.js`, por lo que mantener npm en runtime aumentaba innecesariamente la superficie de ataque.

- **Fuentes consultadas:**
  - Docker Scout.
  - Docker Docs — análisis de vulnerabilidades de imágenes.
  - Base de datos CVE mostrada por Docker Scout.

- **Cómo lo verifiqué:**

  Escaneo inicial:

  ```bash
  docker scout quickview perfil-api:reto5-before
  docker scout cves --only-severity critical,high perfil-api:reto5-before
  ```
  Resultado:
  ```bash
  CRITICAL: 2
  HIGH: 17
  Health score: C (56%)
  ```
  Luego consulté las recomendaciones de Docker Scout:
  ```bash
  docker scout recommendations perfil-api:reto5-before
  ```
  Scout indicó que la imagen base node:22.23.3-bookworm-slim ya estaba actualizada, por lo que cambiar únicamente la versión base no aportaba una mejora directa.
  Por eso opté por reducir la superficie de ataque eliminando npm de la etapa final, ya que la API se ejecuta directamente con Node.js y no necesita npm en runtime.

  Después de eliminar npm de la imagen de ejecución:

  ```bash
  docker scout quickview perfil-api:reto5-after
  docker scout cves --only-severity critical,high perfil-api:reto5-after
  ```

  Resultado:
  ```bash
  CRITICAL: 2
  HIGH: 9
  Health score: B (78%)
  ```
  Se eliminaron 8 vulnerabilidades HIGH. Además, Scout pasó de detectar 397 paquetes a 214.
  Una de las vulnerabilidades eliminadas fue CVE-2026-48815, que afectaba a sigstore 3.1.0 y tenía severidad HIGH. El paquete estaba incluido dentro de npm y desapareció al retirar npm de la imagen final.

- **Qué no me funcionó:**
  Cambiar simplemente la imagen base no era suficiente. Al ejecutar: docker scout recommendations perfil-api:reto5-before comprobé que node:22.23.3-bookworm-slim ya estaba actualizada.
  Las vulnerabilidades críticas restantes pertenecen a paquetes de la imagen base y actualmente aparecen como Fixed version: not fixed