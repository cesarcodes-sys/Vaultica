<template>
    <div class="auth-container">
        <div class="brand-container">
            <h1 class="brand-title">Vaultica</h1>
        </div>
        <div class="auth-card">
            <div class="auth-header">
                <h2>Gestor de Contraseñas</h2>
                <h3>Crear Cuenta</h3>
            </div>
            <form @submit.prevent="register" class="auth-form">
                <!-- Campo de nombre de usuario -->
                <div class="form-group">
                    <label for="username">Nombre de usuario</label>
                    <div class="input-wrapper">
                        <i class="fas fa-user input-icon"></i>
                        <input 
                            id="username" 
                            type="text" 
                            v-model.trim="username" 
                            required 
                            autocomplete="username"
                            :class="{'input-error': errors.username}"
                        />
                    </div>
                    <div class="error-message" v-if="errors.username">{{ errors.username }}</div>
                </div>
                
                <!-- Campo de contraseña -->
                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock input-icon"></i>
                        <input 
                            id="password" 
                            :type="showPassword ? 'text' : 'password'" 
                            v-model="password" 
                            required 
                            autocomplete="new-password"
                            :class="{'input-error': errors.password}"
                        />
                        <button 
                            type="button" 
                            class="show-password-btn" 
                            @click="showPassword = !showPassword"
                            tabindex="-1"
                        >
                            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
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
                
                <!-- Campo de confirmación de contraseña -->
                <div class="form-group">
                    <label for="password-confirm">Confirmar contraseña</label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock input-icon"></i>
                        <input 
                            id="password-confirm" 
                            :type="showPassword ? 'text' : 'password'" 
                            v-model="passwordConfirm" 
                            required 
                            autocomplete="new-password"
                            :class="{'input-error': errors.passwordConfirm}"
                        />
                    </div>
                    <div class="error-message" v-if="errors.passwordConfirm">{{ errors.passwordConfirm }}</div>
                </div>

                <!-- Resto del formulario... -->
                <!-- Selección de pregunta de seguridad -->
                <div class="form-group">
                    <label for="security-question">Pregunta de seguridad</label>
                    <div class="input-wrapper">
                        <i class="fas fa-question-circle input-icon"></i>
                        <select 
                            id="security-question" 
                            v-model="securityQuestion" 
                            required
                            :class="{'input-error': errors.securityQuestion}"
                        >
                            <option value="" disabled selected>Selecciona una pregunta</option>
                            <option value="¿Cuál es el nombre de tu primera mascota?">¿Cuál es el nombre de tu primera mascota?</option>
                            <option value="¿En qué ciudad naciste?">¿En qué ciudad naciste?</option>
                            <option value="¿Cuál es el nombre de tu madre?">¿Cuál es el nombre de tu madre?</option>
                            <option value="¿Cuál es tu comida favorita?">¿Cuál es tu comida favorita?</option>
                            <option value="other">Otra pregunta</option>
                        </select>
                    </div>
                    <div class="error-message" v-if="errors.securityQuestion">{{ errors.securityQuestion }}</div>
                </div>

                <!-- Campo para pregunta personalizada (solo visible si selecciona "other") -->
                <div class="form-group" v-if="securityQuestion === 'other'">
                    <label for="custom-question">Tu pregunta personalizada</label>
                    <div class="input-wrapper">
                        <i class="fas fa-question input-icon"></i>
                        <input 
                            id="custom-question" 
                            type="text" 
                            v-model.trim="customQuestion" 
                            required
                            :class="{'input-error': errors.customQuestion}"
                        />
                    </div>
                    <div class="error-message" v-if="errors.customQuestion">{{ errors.customQuestion }}</div>
                </div>

                <!-- Respuesta de seguridad -->
                <div class="form-group">
                    <label for="security-answer">Respuesta de seguridad</label>
                    <div class="input-wrapper">
                        <i class="fas fa-key input-icon"></i>
                        <input 
                            id="security-answer" 
                            type="text" 
                            v-model.trim="securityAnswer" 
                            required
                            :class="{'input-error': errors.securityAnswer}"
                        />
                    </div>
                    <div class="error-message" v-if="errors.securityAnswer">{{ errors.securityAnswer }}</div>
                    <div class="form-hint">
                        Esta respuesta te ayudará a recuperar tu cuenta si olvidas tu contraseña
                    </div>
                </div>

                <!-- Términos y condiciones -->
                <div class="form-group">
                    <div class="checkbox-wrapper">
                        <input id="accept-terms" type="checkbox" v-model="acceptTerms" required />
                        <label for="accept-terms">Acepto los términos y condiciones</label>
                    </div>
                    <div class="error-message" v-if="errors.acceptTerms">{{ errors.acceptTerms }}</div>
                </div>

                <!-- Mensaje de error general -->
                <div class="global-error" v-if="errorMessage">
                    {{ errorMessage }}
                </div>

                <!-- Botones de acción -->
                <div class="form-actions">
                    <button type="submit" class="submit-btn" :disabled="isSubmitting || !formValid">
                        {{ isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta' }}
                    </button>
                </div>
                <div class="auth-links">
                    ¿Ya tienes una cuenta? <router-link to="/login">Iniciar sesión</router-link>
                </div>
            </form>
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
            passwordConfirm: '',
            securityQuestion: '',
            customQuestion: '',
            securityAnswer: '',
            acceptTerms: false,
            isSubmitting: false,
            errorMessage: '',
            showPassword: false,
            errors: {
                username: '',
                password: '',
                passwordConfirm: '',
                securityQuestion: '',
                customQuestion: '',
                securityAnswer: '',
                acceptTerms: ''
            }
        };
    },
    computed: {
        formValid() {
            const hasNoErrors = Object.values(this.errors).every(error => !error);
            const requiredFields = this.username && this.password && this.passwordConfirm && 
                                  this.securityQuestion && this.securityAnswer && this.acceptTerms;
            
            // Para pregunta personalizada
            if (this.securityQuestion === 'other' && !this.customQuestion) {
                return false;
            }

            return hasNoErrors && requiredFields;
        }
    },
    watch: {
        username() {
            this.validateUsername();
        },
        password() {
            this.validatePassword();
            if (this.passwordConfirm) {
                this.validatePasswordConfirm();
            }
        },
        passwordConfirm() {
            this.validatePasswordConfirm();
        },
        securityQuestion() {
            this.validateSecurityQuestion();
        },
        customQuestion() {
            if (this.securityQuestion === 'other') {
                this.validateCustomQuestion();
            }
        },
        securityAnswer() {
            this.validateSecurityAnswer();
        },
        acceptTerms() {
            this.validateAcceptTerms();
        }
    },
    methods: {
        // Método para ir al generador de contraseñas
        goToPasswordGenerator() {
            this.$router.push('/password-generator');
        },
        validateUsername() {
            this.errors.username = '';
            if (!this.username) {
                this.errors.username = 'El nombre de usuario es requerido';
            } else if (this.username.length < 3) {
                this.errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
            }
        },
        validatePassword() {
            this.errors.password = '';
            if (!this.password) {
                this.errors.password = 'La contraseña es requerida';
            } else if (this.password.length < 3) {
                this.errors.password = 'La contraseña debe tener al menos 3 caracteres';
            }
        },
        validatePasswordConfirm() {
            this.errors.passwordConfirm = '';
            if (!this.passwordConfirm) {
                this.errors.passwordConfirm = 'Debes confirmar la contraseña';
            } else if (this.password !== this.passwordConfirm) {
                this.errors.passwordConfirm = 'Las contraseñas no coinciden';
            }
        },
        validateSecurityQuestion() {
            this.errors.securityQuestion = '';
            if (!this.securityQuestion) {
                this.errors.securityQuestion = 'Debes seleccionar una pregunta de seguridad';
            }
        },
        validateCustomQuestion() {
            this.errors.customQuestion = '';
            if (!this.customQuestion) {
                this.errors.customQuestion = 'Debes escribir tu pregunta personalizada';
            }
        },
        validateSecurityAnswer() {
            this.errors.securityAnswer = '';
            if (!this.securityAnswer) {
                this.errors.securityAnswer = 'La respuesta de seguridad es requerida';
            } else if (this.securityAnswer.length < 2) {
                this.errors.securityAnswer = 'La respuesta debe tener al menos 2 caracteres';
            }
        },
        validateAcceptTerms() {
            this.errors.acceptTerms = '';
            if (!this.acceptTerms) {
                this.errors.acceptTerms = 'Debes aceptar los términos y condiciones';
            }
        },
        validateForm() {
            this.validateUsername();
            this.validatePassword();
            this.validatePasswordConfirm();
            this.validateSecurityQuestion();
            if (this.securityQuestion === 'other') {
                this.validateCustomQuestion();
            }
            this.validateSecurityAnswer();
            this.validateAcceptTerms();
            
            return this.formValid;
        },
        async register() {
            if (!this.validateForm()) return;

            this.isSubmitting = true;
            this.errorMessage = '';

            try {
                // Determinar la pregunta final (si es personalizada o de la lista)
                const finalQuestion = this.securityQuestion === 'other' 
                    ? this.customQuestion 
                    : this.securityQuestion;

                const response = await this.$axios.post('/api/auth/register', {
                    username: this.username,
                    password: this.password,
                    securityQuestion: finalQuestion,
                    securityAnswer: this.securityAnswer
                });

                // Mostrar mensaje de éxito usando toast si está disponible o alert
                if (this.$toast) {
                    this.$toast.success('Registro exitoso. Por favor inicia sesión.');
                } else {
                    alert('¡Usuario registrado correctamente! Ya puedes iniciar sesión.');
                }

                // Redirigir a la página de login
                this.$router.push('/login');
            } catch (error) {
                console.error('Error al registrar:', error);
                console.log('Detalles del error:', error.response?.data);
                this.handleRegistrationError(error);
            } finally {
                this.isSubmitting = false;
            }
        },
        handleRegistrationError(error) {
            if (error.response?.status === 409 || 
                (error.response?.data?.message && error.response.data.message.includes('ya existe'))) {
                this.errorMessage = 'El nombre de usuario ya está en uso';
            } else if (error.response?.data?.message) {
                this.errorMessage = error.response.data.message;
            } else {
                this.errorMessage = 'Error al conectar con el servidor. Intenta de nuevo más tarde.';
            }
        }
    }
};
</script>

<style scoped>
/* Estilos para el botón del generador de contraseñas */
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

/* Estilo del card de autenticación */
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

/* Estilos para los títulos dentro del card */
.auth-header h2 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
    color: black;
    text-align: center;
}

.auth-header h3 {
    font-size: 1.2rem;
    color: black;
    margin-bottom: 1.5rem;
    text-align: center;
}

/* Mantén todos tus otros estilos específicos del formulario */
.form-group {
    margin-bottom: 1.5rem;
}

.input-wrapper {
    position: relative;
    margin-top: 0.5rem;
}

.input-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #777;
}

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

/* Media queries para responsividad */
@media (max-width: 768px) {
    .brand-title {
        font-size: 2rem;
    }
    
    .auth-header h2 {
        font-size: 1.5rem;
    }
    
    .auth-header h3 {
        font-size: 1rem;
    }
    
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
}
</style>