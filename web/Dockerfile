FROM alpine:3.24

RUN apk add --no-cache nginx=1.30.7-r0

COPY web/nginx.conf /etc/nginx/http.d/default.conf

COPY index.html /usr/share/nginx/html/index.html
COPY styles.css /usr/share/nginx/html/styles.css
COPY responsive.css /usr/share/nginx/html/responsive.css
COPY libro-de-visitas.js /usr/share/nginx/html/libro-de-visitas.js

RUN mkdir -p /run/nginx /var/lib/nginx/tmp \
    && chown -R nginx:nginx /run/nginx /var/lib/nginx /usr/share/nginx/html

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]