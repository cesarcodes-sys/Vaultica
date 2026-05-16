# Etapa de construcción (build)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build  # Genera los archivos en /dist (para Vue/React)

# Etapa de producción (usa Nginx para servir archivos estáticos)
FROM nginx:alpine
# Copia los archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html  
# Configuración personalizada (opcional)
COPY ./nginx.conf /etc/nginx/conf.d/default.conf 
EXPOSE 80