<template>
    <div class="auth-container">
        <!-- Título Vaultica con fondo blanco -->
        <div class="brand-container">
            <h1 class="brand-title">Vaultica</h1>
        </div>
        
        <div class="auth-card">
            <div class="auth-header">
                <h2>Generador de Contraseñas</h2>
                <h3>Crea contraseñas seguras fácilmente</h3>
            </div>
            
            <form @submit.prevent="generatePassword" class="auth-form">
                <div class="form-group">
                    <label for="length">Longitud de la Contraseña</label>
                    <div class="input-wrapper">
                        <i class="fas fa-ruler input-icon"></i>
                        <input 
                            id="length"
                            type="number" 
                            v-model.number="length" 
                            min="8" 
                            max="32" 
                            required 
                            class="input"
                        />
                    </div>
                </div>

                <div class="form-group">
                    <div class="checkbox-group">
                        <label class="checkbox-wrapper">
                            <input 
                                type="checkbox" 
                                v-model="useUppercase" 
                                class="checkbox-input"
                            />
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-label">Incluir Mayúsculas</span>
                        </label>
                    </div>
                    
                    <div class="checkbox-group">
                        <label class="checkbox-wrapper">
                            <input 
                                type="checkbox" 
                                v-model="useNumbers" 
                                class="checkbox-input"
                            />
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-label">Incluir Números</span>
                        </label>
                    </div>
                    
                    <div class="checkbox-group">
                        <label class="checkbox-wrapper">
                            <input 
                                type="checkbox" 
                                v-model="useSymbols" 
                                class="checkbox-input"
                            />
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-label">Incluir Símbolos</span>
                        </label>
                    </div>
                </div>

                <div class="form-actions">
                    <button 
                        type="submit" 
                        class="submit-btn"
                    >
                        <i class="fas fa-key icon-left"></i>
                        Generar Contraseña
                    </button>
                </div>
            </form>

            <div 
                v-if="generatedPassword" 
                class="result-container"
            >
                <h3 class="result-title">Contraseña Generada:</h3>
                <div class="input-wrapper password-display">
                    <input 
                        :value="generatedPassword" 
                        readonly 
                        class="input"
                        ref="passwordInput"
                    />
                    <button 
                        class="copy-btn"
                        @click="copyPassword"
                        title="Copiar contraseña"
                    >
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                <div class="strength-meter">
                    <div class="strength-bar" :class="passwordStrengthClass"></div>
                    <div class="strength-label">{{ passwordStrengthLabel }}</div>
                </div>
                <div class="form-actions">
                    <button 
                        @click="copyPassword" 
                        class="submit-btn secondary"
                    >
                        <i class="fas fa-copy icon-left"></i>
                        Copiar al Portapapeles
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            length: 12,
            useUppercase: true,
            useNumbers: true,
            useSymbols: true,
            generatedPassword: '',
        };
    },
    computed: {
        passwordStrength() {
            if (!this.generatedPassword) return 0;
            
            let strength = 0;
            const length = this.generatedPassword.length;
            
            // Puntos por longitud
            strength += Math.min(Math.floor(length / 3), 4);
            
            // Puntos por diversidad de caracteres
            const hasLowercase = /[a-z]/.test(this.generatedPassword);
            const hasUppercase = /[A-Z]/.test(this.generatedPassword);
            const hasNumbers = /[0-9]/.test(this.generatedPassword);
            const hasSymbols = /[^a-zA-Z0-9]/.test(this.generatedPassword);
            
            const diversity = [hasLowercase, hasUppercase, hasNumbers, hasSymbols]
                .filter(Boolean).length;
            
            strength += diversity * 2;
            
            return Math.min(strength, 10);
        },
        passwordStrengthClass() {
            const strength = this.passwordStrength;
            if (strength < 4) return 'strength-weak';
            if (strength < 7) return 'strength-medium';
            if (strength < 9) return 'strength-strong';
            return 'strength-very-strong';
        },
        passwordStrengthLabel() {
            const strength = this.passwordStrength;
            if (strength < 4) return 'Débil';
            if (strength < 7) return 'Moderada';
            if (strength < 9) return 'Fuerte';
            return 'Muy Fuerte';
        }
    },
    methods: {
        generatePassword() {
            const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
            const uppercaseLetters = this.useUppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '';
            const numbers = this.useNumbers ? '0123456789' : '';
            const symbols = this.useSymbols ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '';

            const allCharacters = lowercaseLetters + uppercaseLetters + numbers + symbols;

            let password = this.ensureCharacterTypes(allCharacters);

            while (password.length < this.length) {
                const randomIndex = Math.floor(Math.random() * allCharacters.length);
                password += allCharacters[randomIndex];
            }

            this.generatedPassword = this.shufflePassword(password);
        },
        
        ensureCharacterTypes(allCharacters) {
            let password = '';
            const characterGroups = [
                this.useUppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
                this.useNumbers ? '0123456789' : '',
                this.useSymbols ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '',
                'abcdefghijklmnopqrstuvwxyz'
            ];

            characterGroups.forEach(group => {
                if (group && password.length < this.length) {
                    const randomChar = group[Math.floor(Math.random() * group.length)];
                    password += randomChar;
                }
            });

            return password;
        },

        shufflePassword(password) {
            return password.split('').sort(() => Math.random() - 0.5).join('');
        },

        copyPassword() {
            navigator.clipboard.writeText(this.generatedPassword)
                .then(() => {
                    this.$toast.success('Contraseña copiada al portapapeles');
                })
                .catch(() => {
                    this.$toast.error('Error al copiar la contraseña');
                });
        },
    },
};
</script>

<style scoped>
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

/* Estilo del card de generador */
.auth-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(0, 0, 0, 0.05);
    padding: 2rem;
    width: 100%;
    max-width: 500px;
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

/* Estilos para formulario */
.auth-form {
    margin-top: 1.5rem;
}

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

.input {
    width: 100%;
    padding: 12px 15px 12px 40px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s;
}

.input:focus {
    outline: none;
    border-color: #4CA1AF;
}

/* Estilos para checkboxes */
.checkbox-group {
    margin-bottom: 0.8rem;
}

.checkbox-wrapper {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.checkbox-input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
}

.checkbox-custom {
    height: 20px;
    width: 20px;
    background-color: #fff;
    border: 2px solid #4CA1AF;
    border-radius: 4px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

.checkbox-input:checked ~ .checkbox-custom {
    background-color: #4CA1AF;
}

.checkbox-input:checked ~ .checkbox-custom::after {
    content: "✓";
    color: white;
    font-size: 14px;
}

.checkbox-label {
    font-size: 1rem;
    color: #333;
}

/* Botones */
.form-actions {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
}

.submit-btn {
    background-color: #4CA1AF;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
}

.submit-btn:hover {
    background-color: #3a7d8a;
    transform: translateY(-2px);
}

.submit-btn.secondary {
    background-color: #f5f5f5;
    color: white;
    border: 1px solid #ddd;
}

.submit-btn.secondary:hover {
    background-color: #e9e9e9;
}

.icon-left {
    margin-right: 8px;
}

/* Resultado */
.result-container {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
}

.result-title {
    font-size: 1.2rem;
    color: #2C3E50;
    margin-bottom: 1rem;
    text-align: center;
}

.password-display {
    position: relative;
}

.password-display .input {
    padding-right: 40px;
    font-family: 'Courier New', monospace;
    font-size: 1.1rem;
    letter-spacing: 1px;
    background-color: #f9f9f9;
}

.copy-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #4CA1AF;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 5px;
}

.copy-btn:hover {
    color: #2C3E50;
}

/* Medidor de fortaleza */
.strength-meter {
    margin: 1rem 0;
}

.strength-bar {
    height: 8px;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    transition: all 0.3s;
}

.strength-weak {
    width: 25%;
    background-color: #e74c3c;
}

.strength-medium {
    width: 50%;
    background-color: #f39c12;
}

.strength-strong {
    width: 75%;
    background-color: #3498db;
}

.strength-very-strong {
    width: 100%;
    background-color: #2ecc71;
}

.strength-label {
    font-size: 0.9rem;
    color: #666;
    text-align: center;
    font-weight: 500;
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
    
    .auth-card {
        padding: 1.5rem;
    }
}
</style>