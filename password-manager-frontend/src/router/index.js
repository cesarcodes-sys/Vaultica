import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import PasswordGenerator from '../views/PasswordGenerator.vue';
import ResetPassword from '../views/ResetPassword.vue'

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/dashboard', component: Dashboard },
    { path: '/password-generator', component: PasswordGenerator },
    { path: '/reset-password', component: ResetPassword },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;