import { createApp } from 'vue';
import App from './App.vue';
import axios from 'axios';
import router from './router'; 
import '@fortawesome/fontawesome-free/css/all.css'
// Importar tus estilos globales
import './style.css'

// Configurar Axios
axios.defaults.baseURL = 'http://localhost:5000'; // URL del backend

const app = createApp(App);
app.use(router);
app.config.globalProperties.$axios = axios; // Hacer Axios disponible globalmente
app.mount('#app');