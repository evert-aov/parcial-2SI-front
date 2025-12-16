#!/bin/sh

# Reemplazar el puerto en la configuración de nginx con el valor de la variable PORT
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Iniciar nginx
exec nginx -g 'daemon off;'
