# Vaultica

Administrador de contraseñas desarrollado con Vue.js, Node.js y Docker.

Vaultica permite gestionar credenciales mediante una interfaz moderna e interactiva, incorporando autenticación, generación de contraseñas seguras y arquitectura separada entre frontend y backend.

---

## Características

- Registro e inicio de sesión
- Gestión de credenciales
- Generador de contraseñas seguras
- Frontend moderno con Vue.js
- Backend con API
- Arquitectura fullstack
- Contenedores Docker
- Navegación dinámica
- Componentes reutilizables

---

## 🛠️ Tecnologías utilizadas

### Frontend
- Vue.js
- Vue Router
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js

### DevOps
- Docker
- Docker Compose

---

## Estructura del proyecto

```bash
vaultica/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

# ⚙️ Instalación

Clona el repositorio:

```bash
git clone https://github.com/cesarcodes-sys/vaultica.git
```

Entra al proyecto:

```bash
cd vaultica
```

---

# Ejecución local

## 1. Backend

Entrar al backend:

```bash
cd backend
```

Instalar dependencias:

```bash
npm install
```

Ejecutar servidor:

```bash
npm run dev
```

---

## 2. Frontend

Abrir otra terminal y entrar al frontend:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Ejecutar aplicación:

```bash
npm run dev
```

---

# Ejecución con Docker

## Construir y levantar contenedores

Desde la raíz del proyecto:

```bash
docker compose up --build
```

---

## Detener contenedores

```bash
docker compose down
```

---

# Variables de entorno

Crear archivos `.env` según la configuración del backend y frontend.

Ejemplo:

```env
PORT=3000
JWT_SECRET=your_secret
```

---

# Conceptos aplicados

- SPA (Single Page Application)
- Arquitectura fullstack
- APIs REST
- Componentización
- Routing
- Manejo de formularios
- Autenticación
- Dockerización de servicios
- Comunicación frontend/backend
---

# Sobre el proyecto

Proyecto desarrollado para practicar desarrollo fullstack moderno utilizando Vue.js, Node.js y Docker, aplicando separación de responsabilidades entre frontend y backend.
