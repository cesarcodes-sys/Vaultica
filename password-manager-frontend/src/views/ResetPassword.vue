<template>
    <div class="auth-container">
        <div class="brand-container">
            <h1 class="brand-title">Vaultica</h1>
        </div>
        <div class="auth-card">
            <div class="auth-header">
                <h2>Gestor de Contraseñas</h2>
                <h3>Recuperar Contraseña</h3>
            </div>
            
            <!-- Paso 1: Solicitar nombre de usuario -->
            <form v-if="currentStep === 1" @submit.prevent="getSecurityQuestion" class="auth-form">
                <div class="form-group">
                    <label for="username">Usuario</label>
                    <div class="input-wrapper">
                        <i class="fas fa-user input-icon"></i>
                        <input id="username" type="text" v-model.trim="username"
                            :class="{ 'input-error': errors.username }" required />
                    </div>
                    <div class="error-message" v-if="errors.username">{{ errors.username }}</div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="submit-btn" :disabled="isSubmitting || !username">
                        {{ isSubmitting ? 'Verificando...' : 'Continuar' }}
                    </button>
                    <button type="button" class="cancel-btn" @click="goToLogin">Cancelar</button>
                </div>
            </form>

            <!-- Paso 2: Mostrar pregunta de seguridad y pedir respuesta y nueva contraseña -->
            <form v-if="currentStep === 2" @submit.prevent="resetPassword" class="auth-form">
                <div class="form-group">
                    <label>Pregunta de seguridad:</label>
                    <div class="security-question">{{ securityQuestion }}</div>
                </div>

                <div class="form-group">
                    <label for="security-answer">Tu respuesta:</label>
                    <div class="input-wrapper">
                        <i class="fas fa-key input-icon"></i>
                        <input id="security-answer" type="text" v-model.trim="securityAnswer"
                            :class="{ 'input-error': errors.securityAnswer }" required />
                    </div>
                    <div class="error-message" v-if="errors.securityAnswer">{{ errors.securityAnswer }}</div>
                </div>

                <div class="form-group">
                    <label for="new-password">Nueva contraseña:</label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock input-icon"></i>
                        <input id="new-password" :type="showPassword ? 'text' : 'password'" v-model="newPassword"
                            :class="{ 'input-error': errors.newPassword }" required />
                        <button type="button" class="show-password-btn" @click="togglePasswordVisibility">
                            <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                        </button>
                    </div>
                    <div class="error-message" v-if="errors.newPassword">{{ errors.newPassword }}</div>
                </div>

                <div class="form-group">
                    <label for="confirm-password">Confirmar contraseña:</label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock input-icon"></i>
                        <input id="confirm-password" :type="showPassword ? 'text' : 'password'" v-model="confirmPassword"
                            :class="{ 'input-error': errors.confirmPassword }" required />
                    </div>
                    <div class="error-message" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="submit-btn" :disabled="isSubmitting || hasErrors">
                        {{ isSubmitting ? 'Actualizando...' : 'Actualizar contraseña' }}
                    </button>
                    <button type="button" class="cancel-btn" @click="goToLogin">Cancelar</button>
                </div>
            </form>

            <!-- Paso 3: Mensaje de éxito -->
            <div v-if="currentStep === 3" class="success-container">
                <div class="success-message">
                    <i class="fas fa-check-circle success-icon"></i>
                    <p>¡Contraseña actualizada con éxito!</p>
                </div>
                <div class="form-actions">
                    <button type="button" class="submit-btn" @click="goToLogin">Ir a iniciar sesión</button>
                </div>
            </div>

            <div v-if="errorMessage" class="global-error">
                {{ errorMessage }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            currentStep: 1,
            username: '',
            securityQuestion: '',
            securityAnswer: '',
            newPassword: '',
            confirmPassword: '',
            showPassword: false,
            isSubmitting: false,
            errorMessage: '',
            errors: {
                username: '',
                securityAnswer: '',
                newPassword: '',
                confirmPassword: ''
            }
        };
    },
    computed: {
        hasErrors() {
            return Object.values(this.errors).some(error => !!error);
        }
    },
    methods: {
        togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
        },
        goToLogin() {
            this.$router.push('/login');
        },
        validateNewPassword() {
            this.errors.newPassword = '';
            
            if (!this.newPassword) {
                this.errors.newPassword = 'La nueva contraseña es obligatoria';
            } else if (this.newPassword.length < 3) {
                this.errors.newPassword = 'La contraseña debe tener al menos 3 caracteres';
            }
        },
        validateConfirmPassword() {
            this.errors.confirmPassword = '';
            
            if (!this.confirmPassword) {
                this.errors.confirmPassword = 'Debes confirmar la contraseña';
            } else if (this.newPassword !== this.confirmPassword) {
                this.errors.confirmPassword = 'Las contraseñas no coinciden';
            }
        },
        async getSecurityQuestion() {
            if (!this.username) {
                this.errors.username = 'Debes ingresar un nombre de usuario';
                return;
            }

            this.isSubmitting = true;
            this.errorMessage = '';

            try {
                const response = await this.$axios.post('/api/auth/get-security-question', {
                    username: this.username
                });

                this.securityQuestion = response.data.securityQuestion;
                this.currentStep = 2;
            } catch (error) {
                console.error('Error al obtener pregunta de seguridad:', error);
                
                if (error.response?.status === 404) {
                    this.errorMessage = 'Usuario no encontrado';
                } else {
                    this.errorMessage = 'Error al procesar la solicitud. Intenta de nuevo más tarde.';
                }
            } finally {
                this.isSubmitting = false;
            }
        },
        async resetPassword() {
            // Validaciones
            this.validateNewPassword();
            this.validateConfirmPassword();
            
            if (this.hasErrors) return;
            if (!this.securityAnswer) {
                this.errors.securityAnswer = 'Debes responder la pregunta de seguridad';
                return;
            }

            this.isSubmitting = true;
            this.errorMessage = '';

            try {
                await this.$axios.post('/api/auth/reset-password', {
                    username: this.username,
                    securityAnswer: this.securityAnswer,
                    newPassword: this.newPassword
                });

                // Avanzar al paso de éxito
                this.currentStep = 3;
            } catch (error) {
                console.error('Error al restablecer contraseña:', error);
                
                if (error.response?.status === 401) {
                    this.errorMessage = 'Respuesta de seguridad incorrecta';
                } else if (error.response?.data?.message) {
                    this.errorMessage = error.response.data.message;
                } else {
                    this.errorMessage = 'Error al actualizar la contraseña. Intenta de nuevo más tarde.';
                }
            } finally {
                this.isSubmitting = false;
            }
        }
    }
};
</script>

<style scoped>
.security-question {
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 6px;
    font-weight: 500;
    color: #2C3E50;
    border-left: 4px solid #4CA1AF;
}

.success-container {
    text-align: center;
    padding: 20px 0;
}

.success-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
}

.success-icon {
    font-size: 48px;
    color: #4CAF50;
    margin-bottom: 15px;
}

.success-message p {
    font-size: 18px;
    color: #333;
    font-weight: 500;
}

.form-group {
    margin-bottom: 20px;
}

/* Estilos base consistentes */
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
    color: #2C3E50;
    text-align: center;
}

.auth-header h3 {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 1.5rem;
    text-align: center;
}

/* Estilos específicos para recuperación de contraseña */
.security-question {
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 6px;
    font-weight: 500;
    color: #2C3E50;
    border-left: 4px solid #4CA1AF;
    margin-top: 0.5rem;
}

.success-container {
    text-align: center;
    padding: 20px 0;
}

.success-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
}

.success-icon {
    font-size: 3rem;
    color: #4CAF50;
    margin-bottom: 1rem;
}

.success-message p {
    font-size: 1.1rem;
    color: #333;
    font-weight: 500;
    margin-bottom: 1.5rem;
}

/* Estilos comunes para formularios */
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

.input-error {
    border-color: #e74c3c !important;
}

.error-message {
    color: #e74c3c;
    font-size: 0.85rem;
    margin-top: 0.3rem;
}

.global-error {
    color: #e74c3c;
    text-align: center;
    margin: 1rem 0;
    font-weight: 500;
}

/* Botones */
.form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
}

.submit-btn {
    background-color: #4CA1AF;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 12px 20px;
    font-weight: 500;
    cursor: pointer;
    flex: 1;
    transition: all 0.3s ease;
}

.submit-btn:hover {
    background-color: #3a7d8a;
}

.submit-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.cancel-btn {
    background-color: #f5f5f5;
    color: #555;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 12px 20px;
    font-weight: 500;
    cursor: pointer;
    flex: 1;
    transition: all 0.3s ease;
}

.cancel-btn:hover {
    background-color: #e9e9e9;
}

.show-password-btn {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #777;
    cursor: pointer;
}

/* Responsividad */
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
    
    .form-actions {
        flex-direction: column;
    }
    
    .submit-btn, .cancel-btn {
        width: 100%;
    }
}
</style>