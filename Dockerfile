# Dockerfile para React Frontend
FROM node:18-alpine as build

# Configurar directorio de trabajo
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para el build)
RUN npm install --production=false

# Copiar código fuente
COPY . .

# Argumento de build para la URL del API
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build de producción
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine

# Instalar gettext para envsubst
RUN apk add --no-cache gettext

# Copiar build de React
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar script de entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Exponer puerto 80 (Railway usará PORT env var)
EXPOSE 80

# Comando de inicio
ENTRYPOINT ["/docker-entrypoint.sh"]
