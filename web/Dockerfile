FROM nginxinc/nginx-unprivileged:1.30-alpine3.24

COPY web/nginx.conf /etc/nginx/conf.d/default.conf

COPY index.html /usr/share/nginx/html/index.html
COPY styles.css /usr/share/nginx/html/styles.css
COPY responsive.css /usr/share/nginx/html/responsive.css
COPY libro-de-visitas.js /usr/share/nginx/html/libro-de-visitas.js

USER 101

EXPOSE 8080