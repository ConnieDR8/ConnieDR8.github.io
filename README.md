# Perfil: Connie Yamile Durán Ramírez

[![CI/CD](https://github.com/ConnieDR8/ConnieDR8.github.io/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/ConnieDR8/ConnieDR8.github.io/actions/workflows/ci-cd.yml)


Sitio personal publicado en https://ConnieDR8.github.io

## Cómo se publica

Cada cambio pasa por el pipeline CI/CD. Un push a `main` permite desplegar el sitio después de superar las verificaciones y recibir aprobación manual.

## Delivery o deployment

Este laboratorio implementa **Continuous Delivery**. Cada pull request hacia `main` ejecuta las etapas `build`, `test`, `package`, `security` y `smoke`, pero no despliega.

Cuando los cambios se integran en `main`, el pipeline vuelve a comprobarlos. Si todas las etapas pasan, `deploy-prod` espera la aprobación de una persona mediante el environment `github-pages`. Después publica el artefacto `github-pages`, generado exclusivamente desde `_site/`.

La diferencia con **Continuous Deployment** es la aprobación humana: en Continuous Deployment el despliegue se ejecutaría automáticamente después de superar las verificaciones.

Para cambiar a Continuous Deployment, quitaría la exigencia de aprobación manual del environment, manteniendo las pruebas y la condición que limita el despliegue a `main`.

No lo haría en este laboratorio porque la revisión humana permite comprobar los cambios antes de publicarlos. En un sitio con cambios frecuentes y pruebas suficientemente confiables, el despliegue automático podría resultar conveniente.

La publicación se realiza mediante GitHub Actions, no desde toda la rama `main`, para evitar exponer archivos internos como `compose.yaml`, `api/` o `.env.example`.

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


 ### Reto 6: Cero secretos y arranque automático

- **Decisión:**
  Parte de este reto ya había sido implementada durante B3. El archivo `.env` no se almacena en Git; cuando un Codespace nuevo inicia, `.devcontainer/start-lab.sh` genera automáticamente una contraseña de desarrollo y crea el `.env` local antes de ejecutar Docker Compose.

- **Alternativas que evalué:**
  - Guardar `.env` en el repositorio: permitiría arrancar fácilmente, pero expondría credenciales y está prohibido.
  - Usar secretos personales de GitHub Codespaces: protege la contraseña, pero el evaluador no tendría acceso a los secretos configurados en mi cuenta.
  - Generar una credencial de desarrollo al iniciar el Codespace: mantiene el secreto fuera del repositorio y permite que cualquier Codespace nuevo arranque automáticamente.

- **Por qué elegí esta:**
  Porque resuelve ambos requisitos: no almacenar credenciales reales en Git ni en las imágenes y, al mismo tiempo, permitir que un Codespace nuevo funcione sin intervención. La contraseña generada es una credencial de desarrollo efímera, no un secreto de producción.

- **Fuentes consultadas:**
  - Docker Docs — variables de entorno y sustitución en Compose.
  - Docker Docs — buenas prácticas para secretos en Dockerfiles.
  - GitHub Docs — secretos de GitHub Codespaces.

- **Cómo lo verifiqué:**

  Confirmé que `.env` está ignorado:

  ```bash
  git check-ignore -v .env
  ```
  Resultado:
  ```text
  .gitignore:3:.env    .env
  ```

  Comprobé que .env nunca apareció en el historial:
  ```bash
  git log --all --full-history -- .env
  ```
  El comando no produjo salida.
  También comprobé que existe .env.example y revisé las capas de las imágenes:
   ```bash
  docker history --no-trunc perfil-api
  docker history --no-trunc perfil-web
  docker history --no-trunc perfil-db
  ```
  También comprobé que existe `.env.example` y revisé el historial completo de las capas de las tres imágenes:

  ```bash
  docker history --no-trunc perfil-api
  docker history --no-trunc perfil-web
  docker history --no-trunc perfil-db
  ```

  Como verificación complementaria, filtré el historial buscando nombres comunes asociados a credenciales y secretos:

  ```powershell
  docker history --no-trunc perfil-api | Select-String -Pattern 'POSTGRES_PASSWORD|DB_PASSWORD|PASSWORD=|SECRET|TOKEN|API_KEY|PRIVATE_KEY'

  docker history --no-trunc perfil-web | Select-String -Pattern 'POSTGRES_PASSWORD|DB_PASSWORD|PASSWORD=|SECRET|TOKEN|API_KEY|PRIVATE_KEY'

  docker history --no-trunc perfil-db | Select-String -Pattern 'POSTGRES_PASSWORD|DB_PASSWORD|PASSWORD=|SECRET|TOKEN|API_KEY|PRIVATE_KEY'
  ```

  No se encontraron contraseñas, tokens ni secretos incorporados en las imágenes.
  Estos comandos no produjeron resultados, por lo que no se encontraron contraseñas, tokens ni secretos incorporados en las capas de las imágenes.

  Finalmente, se creó un Codespace nuevo desde `main`. Sin ejecutar comandos manuales, el script generó su propio `.env`, levantó los tres servicios y la aplicación quedó disponible automáticamente.
  Verifiación del codespace:
  ```bash
  @ConnieDR8 ➜ /workspaces/ConnieDR8.github.io (main) $ test -f .env && echo ".env generado correctamente"
  .env generado correctamente

  @ConnieDR8 ➜ /workspaces/ConnieDR8.github.io (main) $ docker compose ps
  NAME                      IMAGE                   COMMAND                  SERVICE   CREATED         STATUS                        PORTS
  conniedr8githubio-api-1   conniedr8githubio-api   "docker-entrypoint.s…"   api       2 minutes ago   Up 2 minutes (healthy)        3000/tcp
  conniedr8githubio-db-1    conniedr8githubio-db    "docker-entrypoint.s…"   db        2 minutes ago   Up 2 minutes (healthy)        5432/tcp
  conniedr8githubio-web-1   conniedr8githubio-web   "/docker-entrypoint.…"   web       2 minutes ago   Up About a minute (healthy)   0.0.0.0:8080->8080/tcp, [::]:8080->8080/tcp
  @ConnieDR8 ➜ /workspaces/ConnieDR8.github.io (main) $ curl -I http://localhost:8080
  HTTP/1.1 200 OK
  Server: nginx/1.30.5
  Date: Sat, 26 Sep 2026 04:31:20 GMT
  Content-Type: text/html
  Content-Length: 5631
  Last-Modified: Sat, 26 Sep 2026 04:27:06 GMT
  Connection: keep-alive
  ETag: "6ab7499a-15ff"
  Accept-Ranges: bytes
  ```
- **Qué no me funcionó:**
  Usar un secreto personal de Codespaces no era una solución adecuada para la evaluación, porque esos secretos pertenecen a mi cuenta y no estarían disponibles cuando otra persona cree un Codespace del repositorio. Por eso se optó por generar automáticamente una credencial local de desarrollo.

## Bitácora LAB-03 — Pipeline CI/CD

En este laboratorio implementé un pipeline de integración y entrega continua utilizando GitHub Actions. El objetivo fue automatizar la construcción, las pruebas, la publicación de imágenes Docker, los análisis de seguridad y la verificación del sitio antes de desplegarlo en GitHub Pages.

El pipeline está organizado en seis jobs: `build`, `test`, `package`, `security`, `smoke` y `deploy-prod`. Los primeros cinco validan los cambios, mientras que el despliegue requiere aprobación manual y solamente se ejecuta desde `main`.

**Repositorio:** https://github.com/ConnieDR8/ConnieDR8.github.io

**Sitio:** https://conniedr8.github.io/

**Workflow:** `.github/workflows/ci-cd.yml`

### Reto 1: Pipeline rápido

**Decisión:**

Optimicé el pipeline utilizando caché de capas Docker con Buildx, una configuración específica de Docker Compose para CI y la ejecución paralela de Semgrep y Trivy. Además, agrupé la publicación de los reportes SARIF para reducir el tiempo dedicado a enviarlos a GitHub.

**Alternativas que evalué:**

- Construir las imágenes de integración con acciones Buildx independientes o directamente mediante Docker Compose.
- Publicar los reportes SARIF por separado o agruparlos.
- Ejecutar Semgrep y Trivy secuencialmente o en paralelo.
- Mantener los intervalos originales de healthcheck o configurar verificaciones más frecuentes para CI.

**Por qué elegí esta solución:**

Mi objetivo era reducir los tiempos sin eliminar pruebas ni controles de seguridad. Utilicé Buildx para reutilizar capas durante la publicación de imágenes y ejecuté simultáneamente los análisis que no dependen entre sí.

También agregué `compose.ci.yaml` para ajustar los intervalos de healthcheck sin modificar el funcionamiento habitual de Docker Compose fuera de CI.

**Cómo lo verifiqué:**

Comparé los tiempos reales de los cinco jobs obligatorios, sin incluir el despliegue ni la espera de aprobación.

| Job | Antes de R1 | Después de R1 |
|---|---:|---:|
| build | 13 s | 18 s |
| test | 56 s | 50 s |
| package | 37 s | 26 s |
| security | 70 s | 31 s |
| smoke | 16 s | 7 s |
| **Total** | **192 s** | **132 s** |

La reducción respecto a la versión inmediatamente anterior a R1 fue:

**(192 - 132) / 192 × 100 = 31.25 %**

**Evidencias:**

- [PR #38 — Optimización del pipeline](https://github.com/ConnieDR8/ConnieDR8.github.io/pull/38)
- [Antes de R1 — Run #46](https://github.com/ConnieDR8/ConnieDR8.github.io/actions/runs/38107314736)
- [Después de R1 — Run #56](https://github.com/ConnieDR8/ConnieDR8.github.io/actions/runs/38111994418)

**Consideración sobre la primera versión funcional:**

La primera versión funcional histórica, registrada en el [run #9](https://github.com/ConnieDR8/ConnieDR8.github.io/actions/runs/37958394200), tardó aproximadamente 117 segundos en los cinco jobs anteriores al despliegue.

Esa versión todavía no incluía las pruebas completas de integración de R3 ni los análisis adicionales de R2. Por ello, aunque conseguí una reducción del 31.25 % respecto al pipeline inmediatamente anterior a R1, no puedo afirmar una reducción equivalente respecto a la primera versión funcional histórica.

**Qué no me funcionó:**

Mi primera optimización agregó tres construcciones Buildx consecutivas al job `test`. En lugar de reducir el tiempo, este aumentó de 56 a 127 segundos.

Lo solucioné eliminando esas construcciones y permitiendo que Docker Compose gestionara directamente las imágenes.

También aparecieron advertencias de configuraciones faltantes en Code Scanning después de agrupar los reportes SARIF. Lo corregí manteniendo las categorías originales de cada análisis.

Finalmente, ejecuté Semgrep y Trivy en paralelo y ajusté `start_interval` en los healthchecks. La última ejecución terminó correctamente con los análisis de seguridad y pruebas aprobados.

**Fuentes consultadas:**

- Docker Docs — Build cache y Docker Buildx.
- Docker Docs — Compose healthcheck.
- GitHub Docs — GitHub Actions y Code Scanning.

### Reto 2: Análisis estático y reportes SARIF

**Decisión:**

Incorporé Semgrep para analizar el código JavaScript y configuré Trivy para generar reportes SARIF de las imágenes web y API.

Los resultados se publican automáticamente en la sección Code Scanning del repositorio.

También creé `.semgrep.yml` para definir reglas de análisis y `.trivyignore` para documentar una excepción temporal de vulnerabilidad.

**Alternativas que evalué:**

- Revisar los resultados únicamente en los logs o publicarlos en Code Scanning.
- Ejecutar el análisis estático fuera del pipeline o integrarlo directamente en GitHub Actions.
- Ignorar todas las vulnerabilidades o conservar el bloqueo por severidad crítica.

**Por qué elegí esta solución:**

Semgrep y Trivy permiten analizar aspectos distintos de la seguridad. Semgrep revisa patrones potencialmente peligrosos en el código fuente, mientras que Trivy identifica vulnerabilidades en los paquetes de las imágenes Docker.

Publicar sus resultados en GitHub facilita revisar los hallazgos y mantener evidencia de los análisis realizados.

**Cómo lo verifiqué:**

Semgrep detectó una advertencia relacionada con la exposición de mensajes internos de error en `api/app.js`.

Trivy registró vulnerabilidades HIGH y MEDIUM en la imagen web, visibles en Code Scanning.

El pipeline también conserva el análisis con `--severity CRITICAL --exit-code 1` para impedir que continúe cuando Trivy detecta vulnerabilidades críticas aplicables que no están exceptuadas.

El archivo `.trivyignore` contiene una excepción temporal documentada para una vulnerabilidad MEDIUM; no desactiva los análisis generales.

**Evidencias:**

- [PR #37 — Semgrep y reportes SARIF](https://github.com/ConnieDR8/ConnieDR8.github.io/pull/37)
- [Run #46 — R2 integrado en main](https://github.com/ConnieDR8/ConnieDR8.github.io/actions/runs/38107314736)
- [Code scanning del repositorio](https://github.com/ConnieDR8/ConnieDR8.github.io/security/code-scanning)

**Qué no me funcionó:**

Durante R1 cambié la subida de tres reportes SARIF independientes a una publicación conjunta. GitHub comenzó a mostrar advertencias porque no encontraba las configuraciones de los análisis anteriores.

Identifiqué que las categorías no conservaban el formato original. Lo corregí asignando los identificadores `semgrep/`, `trivy-web/` y `trivy-api/`.

**Fuentes consultadas:**

- Documentación oficial de Semgrep.
- Documentación oficial de Trivy.
- GitHub Docs — Code Scanning y SARIF.

### Reto 3: Integración con Docker Compose

**Decisión:**

Incorporé pruebas de integración utilizando Docker Compose para ejecutar conjuntamente los servicios `db`, `api` y `web`.

Las comprobaciones se ejecutan mediante `scripts/integracion-compose.mjs` dentro del job `test`.

**Alternativas que evalué:**

- Mantener únicamente las pruebas unitarias de Vitest y Jest.
- Levantar los tres servicios y realizar solicitudes HTTP reales.
- Comprobar solamente que los contenedores iniciaran o verificar también el comportamiento de la API.

**Por qué elegí esta solución:**

Las pruebas unitarias permiten comprobar componentes aislados, pero no garantizan que los servicios funcionen correctamente entre sí.

Con Docker Compose puedo verificar la comunicación entre PostgreSQL, la API y la web, además de comprobar que los endpoints respondan como se espera.

**Cómo lo verifiqué:**

El script realizó cinco comprobaciones:

1. `GET /api/health`: HTTP 200.
2. `POST` con datos válidos: HTTP 201.
3. `POST` sin nombre: HTTP 400.
4. `POST` con un mensaje demasiado largo: HTTP 400.
5. `GET /api/mensajes`: recuperación del mensaje creado.

Al finalizar, el workflow ejecuta `docker compose down -v --remove-orphans` para eliminar los contenedores y el volumen temporal.

**Prueba de fallo controlado:**

Para demostrar que el pipeline realmente detectaba un error, modifiqué temporalmente la respuesta del endpoint de creación de mensajes: devolvía HTTP 202 en lugar del HTTP 201 esperado.

El job `test` detectó la diferencia y terminó en rojo. Posteriormente restauré el comportamiento esperado y confirmé que las verificaciones volvían a aprobarse.

La rama utilizada para provocar el fallo se cerró sin integrarse en `main`.

**Evidencias:**

- [PR #32 — Integración con Compose](https://github.com/ConnieDR8/ConnieDR8.github.io/pull/32)
- [PR #33 — Fallo controlado](https://github.com/ConnieDR8/ConnieDR8.github.io/pull/33)
- [Run en rojo — Fallo controlado](https://github.com/ConnieDR8/ConnieDR8.github.io/actions/runs/37970089234)
- [Run en verde — Comportamiento restaurado](https://github.com/ConnieDR8/ConnieDR8.github.io/actions/runs/37972738407)

**Qué no me funcionó:**

El fallo HTTP 202 fue provocado intencionalmente para demostrar la capacidad del pipeline de detectar regresiones. La prueba exigía HTTP 201 y rechazó la respuesta incorrecta.

**Fuentes consultadas:**

- Docker Docs — Docker Compose.
- Docker Docs — Healthchecks.
- GitHub Docs — GitHub Actions.

### Reto 4: Mínimo privilegio y cadena de suministro

**Decisión:**

Definí permisos específicos para cada job, fijé las GitHub Actions mediante SHA completos y configuré Dependabot para buscar actualizaciones.

**Alternativas que evalué:**

- Utilizar permisos generales o restringirlos por job.
- Referenciar las acciones con etiquetas como `@v4` o fijarlas mediante SHA.
- Actualizar dependencias manualmente o mediante Dependabot.

**Por qué elegí esta solución:**

Los permisos específicos reducen el acceso de cada job a los recursos que realmente necesita.

Por ejemplo, `package` requiere publicar imágenes en GHCR, `security` necesita escribir reportes en Code Scanning y `deploy-prod` necesita permisos para publicar en GitHub Pages.

Los SHA completos identifican una versión exacta de cada acción.

**Cómo lo verifiqué:**

Comprobé la configuración de permisos y las referencias SHA del workflow.

También confirmé que Dependabot creó propuestas automáticas de actualización para diferentes GitHub Actions.

**Evidencias:**

- [PR #26 — Permisos y Dependabot](https://github.com/ConnieDR8/ConnieDR8.github.io/pull/26)
- [Run de validación de R4](https://github.com/ConnieDR8/ConnieDR8.github.io/actions/runs/37962879304)
- [PR de Dependabot](https://github.com/ConnieDR8/ConnieDR8.github.io/pulls)

**Qué no me funcionó:**

No se presentaron fallos importantes durante la implementación. Las actualizaciones propuestas por Dependabot quedaron pendientes de revisión para evitar modificar varias versiones de acciones mientras todavía se validaba el laboratorio.

**Fuentes consultadas:**

- GitHub Docs — GITHUB_TOKEN.
- GitHub Docs — Seguridad de GitHub Actions.
- GitHub Docs — Dependabot.

### Reto 5: Verificación postdeploy y rollback

**Decisión:**

Agregué una verificación automática después de desplegar el sitio en GitHub Pages y realicé una prueba real de rollback usando `git revert`.

**Alternativas que evalué:**

- Considerar el despliegue exitoso únicamente por finalizar el job.
- Comprobar la URL real después de publicar.
- Restaurar archivos manualmente o utilizar una reversión registrada en Git.

**Por qué elegí esta solución:**

Un despliegue puede finalizar sin errores y aun así publicar una versión que no funcione como se espera.

La verificación postdeploy permite comprobar el sitio publicado. Por otro lado, `git revert` deja registrada la recuperación y permite pasar nuevamente por los controles del pipeline.

**Cómo lo verifiqué:**

Implementé `scripts/verificar-produccion.mjs`, que revisa:

- La respuesta HTTP 200 de la página publicada.
- La presencia del nombre del perfil.
- El comportamiento del libro de visitas cuando GitHub Pages devuelve HTTP 404 para `/api/mensajes`.

Después realicé un rollback real:

1. Integré una modificación visual temporal.
2. Aprobé su despliegue en producción.
3. Confirmé que el cambio se publicó.
4. Creé una reversión con `git revert`.
5. Abrí un nuevo Pull Request.
6. Esperé las verificaciones obligatorias.
7. Integré la reversión y aprobé el despliegue.
8. Confirmé que el sitio recuperó su contenido anterior.

**Evidencias:**

- [PR #34 — Verificación postdeploy](https://github.com/ConnieDR8/ConnieDR8.github.io/pull/34)
- [PR #35 — Cambio temporal](https://github.com/ConnieDR8/ConnieDR8.github.io/pull/35)
- [PR #36 — Rollback](https://github.com/ConnieDR8/ConnieDR8.github.io/pull/36)
- [Run final con rollback correcto](https://github.com/ConnieDR8/ConnieDR8.github.io/actions/runs/37980164188)

**Procedimiento de recuperación:**

Si detecto un error en producción, identifico el commit responsable, creo una rama desde `main`, ejecuto `git revert` y abro un Pull Request.

Después de que el pipeline apruebe los controles, integro la reversión, autorizo el despliegue y verifico nuevamente la página publicada.

**Qué no me funcionó:**

No se presentó un fallo inesperado. La modificación temporal fue intencional y permitió comprobar que el procedimiento de reversión funcionaba realmente.

**Fuentes consultadas:**

- GitHub Docs — Environments y despliegues.
- Git — Documentación de `git revert`.
- GitHub Docs — GitHub Pages.

### Reto 6: El pipeline se explica solo

**Decisión:**

Incorporé resúmenes automáticos mediante `GITHUB_STEP_SUMMARY` y un badge de estado del workflow en el README.

Los resúmenes incluyen los resultados de Vitest y Jest, además de las vulnerabilidades identificadas por Trivy y agrupadas según su severidad.

**Alternativas que evalué:**

- Revisar únicamente los logs individuales.
- Generar un resumen de las pruebas y los análisis.
- Mostrar solo vulnerabilidades críticas o incluir todas las severidades.

**Por qué elegí esta solución:**

El resumen facilita revisar el estado general del pipeline sin tener que recorrer todos los logs.

El badge también permite identificar desde el README si el workflow de `main` está funcionando correctamente.

**Cómo lo verifiqué:**

El resumen de pruebas mostró:

| Herramienta | Aprobadas | Fallidas |
|---|---:|---:|
| Vitest — Sitio | 10 | 0 |
| Jest — API | 2 | 0 |
| **Total** | **12** | **0** |

Trivy también generó una tabla con las vulnerabilidades de las imágenes web y API clasificadas por severidad.

**Evidencias:**

- [PR #31 — Resúmenes y badge](https://github.com/ConnieDR8/ConnieDR8.github.io/pull/31)
- [Run de validación de R6](https://github.com/ConnieDR8/ConnieDR8.github.io/actions/runs/37965520129)
- [Estado del workflow](https://github.com/ConnieDR8/ConnieDR8.github.io/actions/workflows/ci-cd.yml)

**Qué no me funcionó:**

Los logs permitían comprobar los resultados, pero no ofrecían una vista rápida. Para solucionarlo, utilicé reportes JSON y generé tablas en `GITHUB_STEP_SUMMARY`.

**Fuentes consultadas:**

- GitHub Actions — Workflow Commands.
- Vitest — Reporters.
- Trivy — Reporting.

### Decisión adicional B3: Construcción del sitio en test

**Decisión:**

El job `test` reconstruye `_site/` mediante `npm run build`, utilizando el mismo commit que `build`.

**Alternativas que evalué:**

- Transferir el artefacto generado por el job `build`.
- Reconstruir el sitio directamente en `test`.

**Por qué elegí esta solución:**

La reconstrucción mantiene una configuración sencilla y permite comprobar nuevamente el sitio generado desde el mismo código.

**Cómo lo verifiqué:**

Vitest y Jest aprobaron correctamente en las ejecuciones del pipeline.

**Qué no me funcionó:**

Inicialmente Vitest intentaba ejecutar también pruebas pertenecientes a Jest. Lo corregí limitando Vitest a los archivos de prueba correspondientes al sitio.

### Conclusión del LAB-03

Al finalizar el laboratorio, implementé un pipeline CI/CD que construye el proyecto, ejecuta pruebas unitarias y de integración, publica imágenes Docker versionadas en GHCR, analiza vulnerabilidades y realiza verificaciones antes del despliegue.

También comprobé el comportamiento del pipeline ante un error intencional y ejecuté un procedimiento real de rollback para recuperar una versión anterior del sitio.

La estrategia implementada corresponde a **Continuous Delivery**, porque `deploy-prod` requiere aprobación manual del environment `github-pages`.

Para convertirla en Continuous Deployment tendría que retirar la aprobación humana obligatoria del environment, manteniendo la condición de despliegue desde `main` y todas las verificaciones del pipeline.

En R1 conseguí reducir el tiempo de los cinco jobs obligatorios de 192 a 132 segundos, una mejora del 31.25 % respecto al pipeline anterior al reto. La primera versión funcional histórica tenía un alcance menor, por lo que esa comparación se documentó por separado.

El resultado es un pipeline con pruebas automatizadas, controles de seguridad, trazabilidad, publicación controlada y un procedimiento de recuperación verificado.
