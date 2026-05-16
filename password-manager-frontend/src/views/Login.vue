<template>
    <div class="auth-container">
    <div class="brand-container">
            <h1 class="brand-title">Vaultica</h1>
        </div>
        <div class="auth-card">
            <div class="auth-header">
                <h2>Gestor de Contraseñas</h2>
                <h3>Iniciar Sesión</h3>
            </div>
            <form @submit.prevent="login" class="auth-form">
                <div class="form-group">
                    <label for="username">Usuario</label>
                    <div class="input-wrapper">
                        <i class="fas fa-user input-icon"></i>
                        <input id="username" type="text" v-model.trim="username"
                            :class="{ 'input-error': errors.username }" @input="validateUsername" required />
                    </div>
                    <div class="error-message" v-if="errors.username">{{ errors.username }}</div>
                </div>

                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock input-icon"></i>
                        <input id="password" :type="showPassword ? 'text' : 'password'" v-model="password"
                            :class="{ 'input-error': errors.password }" @input="validatePassword" required />
                        <button type="button" class="show-password-btn" @click="togglePasswordVisibility">
                            <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                        </button>
                        <!-- Botón para usar generador de contraseñas -->
                        <button 
                            type="button" 
                            class="generate-password-btn" 
                            @click="goToPasswordGenerator"
                            title="Usar generador de contraseñas"
                            tabindex="-1"
                        >
                            <i class="fas fa-key"></i>
                        </button>
                    </div>
                    <div class="error-message" v-if="errors.password">{{ errors.password }}</div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="submit-btn" :disabled="isSubmitting || hasErrors">
                        {{ isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
                    </button>
                </div>

                <div class="auth-links">
                    <p>¿No tienes una cuenta? <router-link to="/register" class="register-link">Regístrate</router-link>
                    </p>
                    <br>
                    <p>
                        ¿Olvidaste tu contraseña?
                        <router-link to="/reset-password" class="reset-password-link">Recuperar contraseña</router-link>
                    </p>
                </div>
            </form>

            <div v-if="errorMessage" class="global-error">
                {{ errorMessage }}
            </div>
        </div>

        <!-- Botón flotante para el generador de contraseñas -->
        <button 
            class="floating-generator-btn" 
            @click="goToPasswordGenerator" 
            title="Generador de contraseñas"
        >
            <i class="fas fa-key"></i>
            <span>Generar contraseña</span>
        </button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            username: '',
            password: '',
            showPassword: false,
            isSubmitting: false,
            errorMessage: '',
            errors: {
                username: '',
                password: '',
            }
        };
    },
    computed: {
        hasErrors() {
            return !!(this.errors.username || this.errors.password);
        }
    },
    methods: {
        // Método para ir al generador de contraseñas
        goToPasswordGenerator() {
            this.$router.push('/password-generator');
        },
        validateUsername() {
            if (!this.username) {
                this.errors.username = 'El nombre de usuario es obligatorio';
            } else {
                this.errors.username = '';
            }
        },
        validatePassword() {
            if (!this.password) {
                this.errors.password = 'La contraseña es obligatoria';
            } else if (typeof this.password !== 'string') {
                this.errors.password = 'Formato de contraseña inválido';
            } else {
                this.errors.password = '';
            }
        },
        togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
        },
        async login() {
            this.validateUsername();
            this.validatePassword();

            if (this.hasErrors) return;

            this.isSubmitting = true;
            this.errorMessage = '';

            try {
                const response = await this.$axios.post('/api/auth/login', {
                    username: this.username,
                    password: this.password
                });

                // Guardar el token JWT en localStorage
                localStorage.setItem('token', response.data.token);
                
                // También guardar el nombre de usuario para mostrarlo en el dashboard
                localStorage.setItem('username', response.data.username);

                // Redirigir al dashboard
                this.$router.push('/dashboard');
            } catch (error) {
                console.error('Error al iniciar sesión:', error);

                if (error.response) {
                    // Error con respuesta del servidor
                    if (error.response.status === 400) {
                        this.errorMessage = error.response.data.message || 'Usuario o contraseña incorrectos';
                    } else if (error.response.status === 500) {
                        this.errorMessage = 'Error en el servidor. Intenta más tarde.';
                    } else {
                        this.errorMessage = error.response.data.message || 'Error al iniciar sesión';
                    }
                } else {
                    // Error sin respuesta del servidor (problemas de red)
                    this.errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
                }
            } finally {
                this.isSubmitting = false;
            }
        },
    },
};
</script>

<style scoped>
.brand-title {
    text-align: center;
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #4CA1AF, #2C3E50);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.auth-header h2 {
    font-size: 1.8rem;
    color: black;
    margin-bottom: 0.5rem;
}

.auth-header h3 {
    font-size: 1.2rem;
    color: black;
    margin-bottom: 1.5rem;
}

.auth-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
}

/* Contenedor para el título con fondo blanco */
.brand-container {
    background: white;
    padding: 1rem 3rem;
    border-radius: 50px;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Estilo del título Vaultica */
.brand-title {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #4CA1AF, #2C3E50);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin: 0;
    text-align: center;
}

/* Mantenemos tus estilos para el auth-card */
.auth-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(0, 0, 0, 0.05);
    padding: 2rem;
    width: 100%;
    max-width: 400px;
    position: relative;
    z-index: 1;
}

.auth-card::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    background: linear-gradient(135deg, rgba(76, 161, 175, 0.3), rgba(44, 62, 80, 0.3));
    z-index: -1;
    border-radius: 16px;
    filter: blur(8px);
}

.generate-password-btn {
    position: absolute;
    right: 45px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #4CA1AF;
    cursor: pointer;
    font-size: 0.9rem;
}

.generate-password-btn:hover {
    color: #2C3E50;
}

/* Botón flotante para generador de contraseñas */
.floating-generator-btn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #4CA1AF;
    color: white;
    border: none;
    border-radius: 50px;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 100;
}

.floating-generator-btn:hover {
    background-color: #2C3E50;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.floating-generator-btn i {
    font-size: 1rem;
}

/* Estilos existentes */
.reset-password-link {
    color: #4CA1AF;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.reset-password-link:hover {
    color: #2C3E50;
    text-decoration: underline;
}

/* Media query para pantallas pequeñas */
@media (max-width: 768px) {
    .floating-generator-btn span {
        display: none;
    }
    
    .floating-generator-btn {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        justify-content: center;
        padding: 0;
    }
    
    .floating-generator-btn i {
        font-size: 1.2rem;
    }
}
</style>