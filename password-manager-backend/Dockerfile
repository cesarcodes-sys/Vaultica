FROM node:18-slim

WORKDIR /app

# Copia primero los archivos de dependencias
COPY package*.json ./

# Instala las dependencias (incluyendo bcryptjs)
RUN npm install

# Copia el resto del código
COPY . .

EXPOSE 5000
CMD ["npm", "start"]