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

# Build de producción
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar build de React
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración de nginx como template
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copiar script de entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Exponer puerto (Railway lo asignará dinámicamente)
EXPOSE 80

# Comando de inicio
CMD ["/docker-entrypoint.sh"]
