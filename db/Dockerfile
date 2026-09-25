# PostgreSQL con el esquema del libro de visitas incluido.
#
# La imagen oficial ejecuta, en orden alfabético, todo .sql que encuentre en
# /docker-entrypoint-initdb.d/, pero SOLO si el directorio de datos está vacío,
# es decir, la primera vez que arranca con un volumen nuevo.
FROM postgres:16.15-alpine3.24

COPY --chown=postgres:postgres init/ /docker-entrypoint-initdb.d/

USER postgres