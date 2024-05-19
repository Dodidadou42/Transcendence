ARG VERSION_NGINX=${VERSION_NGINX}

FROM nginx:${VERSION_NGINX}

RUN apk add curl

###### CREATE SELF SIGNED CERTIFICATE
RUN apk add --no-cache openssl
RUN mkdir -p /var/www/ssl/
RUN openssl req -x509 -newkey rsa:4096 -nodes \
	-out /var/www/ssl/localhost.crt \
	-keyout /var/www/ssl/localhost.key \
	-subj "/C=FR/ST=PACA/L=Nice/O=42/OU=42Nice/CN=localhost"

###### REPLACE NGINX CONF
RUN mkdir -p /etc/nginx/templates/
COPY ./config/Nginx/conf/nginx.conf.template /etc/nginx/templates/nginx.conf.template

###### NON ROOT CONTAINER DIRECTIVE
RUN chown -R nginx:nginx /var/www && \
	chmod -R 755 /var/www && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

COPY ./Backend /app

USER nginx
