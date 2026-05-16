<template>
    <div class="dashboard-container">
        <div class="navbar">
            <div class="navbar-brand">
                <h1 class="brand-title">Vaultica</h1>
            </div>
        </div>
        <div class="dashboard-content">
            <!-- Menú superior con header, búsqueda y acciones -->
            <div class="top-menu">
                <div class="dashboard-header">
                    <h1>Contraseñas</h1>
                </div>
                <div class="menu-actions">
                    <div class="search-container">
                        <div class="input-wrapper">
                            <i class="input-icon fas fa-search"></i>
                            <input 
                                v-model="searchQuery" 
                                type="text" 
                                placeholder="Buscar servicio..." 
                                class="search-input"
                            />
                        </div>
                    </div>
                    <button @click="openNewPasswordForm" class="add-btn" v-if="!showPasswordForm">
                        <i class="fas fa-plus"></i> Nueva Contraseña
                    </button>
                    <button @click="openGenerator" class="generator-btn">
                        <i class="fas fa-key"></i> Generar
                    </button>
                    <button @click="logout" class="logout-btn">
                        <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                    </button>
                </div>
            </div>

            <!-- Formulario para agregar o actualizar contraseña (colapsable) -->
            <div class="password-form-card" v-if="showPasswordForm">
                <div class="form-header">
                    <h2>{{ editMode ? 'Actualizar Contraseña' : 'Agregar Nueva Contraseña' }}</h2>
                    <button @click="closePasswordForm" class="close-form-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="password-form">
                    <div class="form-group">
                        <label>Servicio</label>
                        <div class="input-wrapper">
                            <i class="input-icon fas fa-briefcase"></i>
                            <input v-model="newPassword.service" type="text" placeholder="Nombre del servicio"
                                :class="{ 'input-error': serviceError }" />
                        </div>
                        <span v-if="serviceError" class="error-message">{{ serviceError }}</span>
                    </div>

                    <div class="form-group">
                        <label>Contraseña</label>
                        <div class="input-wrapper">
                            <i class="input-icon fas fa-lock"></i>
                            <input v-model="newPassword.password" :type="showNewPassword ? 'text' : 'password'"
                                placeholder="Contraseña" :class="{ 'input-error': passwordError }" />
                            <button @click="showNewPassword = !showNewPassword" type="button" class="show-password-btn">
                                <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                            </button>
                        </div>
                        <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
                    </div>

                    <div class="form-actions">
                        <button @click="editMode ? updatePasswordHandler() : addPasswordHandler()" class="submit-btn"
                            :disabled="loading">
                            {{ editMode ? 'Actualizar' : 'Agregar' }}
                        </button>
                        <button @click="closePasswordForm" class="cancel-btn">
                            Cancelar
                        </button>
                    </div>
                </div>

                <div v-if="globalError" class="global-error">{{ globalError }}</div>
                <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
            </div>

            <!-- Lista de contraseñas (ocupando el resto del espacio) -->
            <div class="passwords-list-card">
                <div v-if="loading" class="loading-indicator">
                    <p>Cargando contraseñas...</p>
                </div>

                <div v-else-if="filteredPasswords.length === 0 && searchQuery" class="empty-state">
                    <p>No se encontraron resultados para "{{ searchQuery }}"</p>
                </div>

                <div v-else-if="passwords.length === 0" class="empty-state">
                    <p>No hay contraseñas guardadas.</p>
                </div>

                <div v-else class="passwords-table-container">
                    <table class="passwords-table">
                        <thead>
                            <tr>
                                <th>Servicio</th>
                                <th>Contraseña</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(password, index) in filteredPasswords" :key="password._id">
                                <td>{{ password.service }}</td>
                                <td class="password-cell">
                                    <div class="password-display">
                                        <span :class="['masked-password', { 'revealed': password.showPassword }]">
                                            {{ password.showPassword ? (password.decodedPassword || '******') :
                                            '•'.repeat(8) }}
                                        </span>
                                        <div class="password-actions">
                                            <button @click="togglePasswordVisibility(password._id)"
                                                class="view-password-btn"
                                                :title="password.showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                                                <i
                                                    :class="password.showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                            </button>

                                            <button v-if="password.showPassword" @click="copyToClipboard(password._id)"
                                                class="copy-password-btn" title="Copiar contraseña">
                                                <i class="fas fa-copy"></i>
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td class="actions-cell">
                                    <div class="action-buttons">
                                        <button @click="editPassword(password)" class="edit-btn">
                                            <i class="fas fa-edit"></i> Editar
                                        </button>
                                        <button @click="deletePasswordHandler(password._id)" class="delete-btn">
                                            <i class="fas fa-trash-alt"></i> Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'PasswordDashboard',
    data() {
        return {
            // Estado para mostrar/ocultar formulario
            showPasswordForm: false,
            
            // Estado para el formulario
            newPassword: {
                service: '',
                password: ''
            },
            showNewPassword: false,
            editMode: false,
            currentPasswordId: null,

            // Validación
            serviceError: '',
            passwordError: '',
            globalError: '',

            // Estado para las contraseñas
            passwords: [],
            loading: false,

            // Mensajes
            successMessage: '',
            
            // Búsqueda
            searchQuery: '',
        };
    },
    computed: {
        filteredPasswords() {
            if (!this.searchQuery) {
                return this.passwords;
            }
            
            const query = this.searchQuery.toLowerCase();
            return this.passwords.filter(password => 
                password.service.toLowerCase().includes(query)
            );
        }
    },
    mounted() {
        this.fetchPasswords();
    },
    methods: {
        // Mostrar/ocultar formulario
        openNewPasswordForm() {
            this.showPasswordForm = true;
            this.editMode = false;
            this.resetForm();
        },
        
        closePasswordForm() {
            this.showPasswordForm = false;
            this.editMode = false;
            this.resetForm();
        },
        
        // Obtener todas las contraseñas
        async fetchPasswords() {
            this.loading = true;
            try {
                const response = await axios.get('/api/passwords', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    }
                });
                this.passwords = response.data.map(pwd => ({
                    ...pwd,
                    showPassword: false,
                    decodedPassword: null
                }));
            } catch (error) {
                this.globalError = 'Error al cargar las contraseñas';
                console.error('Error fetching passwords:', error);
            } finally {
                this.loading = false;
            }
        },

        // Validar el formulario
        validateForm() {
            let isValid = true;

            // Validar servicio
            if (!this.newPassword.service.trim()) {
                this.serviceError = 'El nombre del servicio es obligatorio';
                isValid = false;
            } else {
                this.serviceError = '';
            }

            // Validar contraseña
            if (!this.newPassword.password) {
                this.passwordError = 'La contraseña es obligatoria';
                isValid = false;
            } else {
                this.passwordError = '';
            }

            return isValid;
        },

        async addPasswordHandler() {
            if (!this.validateForm()) return;
            
            this.loading = true;
            try {
                const response = await axios.post('/api/passwords', {
                    service: this.newPassword.service,
                    password: this.newPassword.password,
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                this.successMessage = 'Contraseña agregada';
                this.globalError = '';
                this.resetForm();
                await this.fetchPasswords();
                
                // Cerrar el formulario después de agregar
                setTimeout(() => {
                    this.successMessage = '';
                    this.showPasswordForm = false;
                }, 2000);
            } catch (error) {
                this.globalError = 'Error al agregar la contraseña';
                console.error('Error al agregar la contraseña:', error);
            } finally {
                this.loading = false;
            }
        },

        // Editar una contraseña existente
        editPassword(password) {
            this.editMode = true;
            this.showPasswordForm = true;
            this.currentPasswordId = password._id;
            this.newPassword.service = password.service;
            this.newPassword.password = ''; // Por seguridad, no rellenamos la contraseña
            this.serviceError = '';
            this.passwordError = '';
            this.globalError = '';
        },

        // Actualizar una contraseña
        async updatePasswordHandler() {
            if (!this.validateForm()) return;

            this.loading = true;
            try {
                await axios.put(`/api/passwords/${this.currentPasswordId}`, {
                    service: this.newPassword.service,
                    password: this.newPassword.password
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                this.successMessage = 'Contraseña actualizada correctamente';
                this.globalError = '';
                this.resetForm();
                this.editMode = false;
                this.currentPasswordId = null;
                await this.fetchPasswords();

                // Cerrar el formulario después de actualizar
                setTimeout(() => {
                    this.successMessage = '';
                    this.showPasswordForm = false;
                }, 2000);
            } catch (error) {
                this.globalError = 'Error al actualizar la contraseña';
                console.error('Error updating password:', error);
            } finally {
                this.loading = false;
            }
        },

        // Eliminar una contraseña
        async deletePasswordHandler(passwordId) {
            if (confirm('¿Está seguro de que desea eliminar esta contraseña?')) {
                this.loading = true;
                try {
                    await axios.delete(`/api/passwords/${passwordId}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    this.successMessage = 'Contraseña eliminada correctamente';
                    this.globalError = '';
                    await this.fetchPasswords();

                    setTimeout(() => {
                        this.successMessage = '';
                    }, 2000);
                } catch (error) {
                    this.globalError = 'Error al eliminar la contraseña';
                    console.error('Error deleting password:', error);
                } finally {
                    this.loading = false;
                }
            }
        },

        // Mostrar/ocultar contraseña en la lista
        async togglePasswordVisibility(passwordId) {
            const passwordIndex = this.passwords.findIndex(p => p._id === passwordId);
            if (passwordIndex === -1) return;

            // Si ya está mostrando la contraseña, simplemente la ocultamos
            if (this.passwords[passwordIndex].showPassword) {
                this.passwords[passwordIndex].showPassword = false;
                return;
            }

            try {
                const response = await axios.get(`/api/passwords/${passwordId}/decrypt`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                const decryptedPassword = response.data.password;
                this.passwords[passwordIndex].decodedPassword = decryptedPassword;
                this.passwords[passwordIndex].showPassword = true;

            } catch (error) {
                console.error('Error al obtener la contraseña:', error);
                this.$toast.error('No se pudo obtener la contraseña');
            }
        },

        copyToClipboard(passwordId) {
            const password = this.passwords.find(p => p._id === passwordId);
            if (!password || !password.decodedPassword) return;

            navigator.clipboard.writeText(password.decodedPassword)
                .then(() => {
                    alert('Contraseña copiada al portapapeles');
                })
                .catch(err => {
                    console.error('Error al copiar:', err);
                    alert('Error al copiar la contraseña');
                });
        },

        openGenerator() {
            window.open('/password-generator', '_blank');
        },
        
        // Resetear el formulario
        resetForm() {
            this.newPassword = {
                service: '',
                password: ''
            };
            this.showNewPassword = false;
            this.serviceError = '';
            this.passwordError = '';
        },
        
        // Cerrar sesión
        logout() {
            localStorage.removeItem('token');
            this.$router.push('/login');
        }
    }
};
</script>

<style>
/* Estilos base */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
}

body {
    background: linear-gradient(135deg, #2C3E50, #4CA1AF);
    color: #333;
    min-height: 100vh;
}

/* Contenedores principales */
.dashboard-container {
    min-height: 100vh;
    padding: 20px 0;
    flex-direction: column;
}

.dashboard-content {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

/* Menú superior */
.top-menu {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 15px 25px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 100;
    margin-bottom: 20px;
}

.dashboard-header h1 {
    font-size: 24px;
    color: #2C3E50;
    font-weight: 600;
    margin: 0;
}

/* Corección para el título con fondo azul */
.dashboard-header h1 {
    background: transparent;
}

.menu-actions {
    display: flex;
    align-items: center;
    gap: 15px;
}

.search-container {
    min-width: 250px;
}

.search-input {
    width: 100%;
    border-radius: 20px;
    background-color: #f5f5f5;
    border: 1px solid #e9e9e9;
    padding: 10px 15px 10px 40px;
    font-size: 14px;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon {
    position: absolute;
    left: 15px;
    color: #777;
    font-size: 14px;
    z-index: 1;
}

.add-btn,
.generator-btn,
.logout-btn {
    padding: 10px 15px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    outline: none;
}

.add-btn {
    background: #4CAF50;
    color: white;
}

.add-btn:hover {
    background: #3f9142;
    transform: translateY(-2px);
}

.generator-btn {
    background: #3498db;
    color: white;
}

.generator-btn:hover {
    background: #2980b9;
    transform: translateY(-2px);
}

.logout-btn {
    background: #f5f5f5;
    color: #555;
    border: 1px solid #ddd;
}

.logout-btn:hover {
    background: #e9e9e9;
}

.form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 15px;
    position: relative;
}

.close-form-btn {
    position: absolute;
    right: 0;
    top: 0;
    background: none;
    border: none;
    font-size: 18px;
    color: #777;
    cursor: pointer;
    transition: color 0.2s;
}

.close-form-btn:hover {
    color: #e74c3c;
}

/* Lista de contraseñas */
.passwords-list-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 20px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.passwords-table-container {
    flex-grow: 1;
    overflow-x: auto;
}

.passwords-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
}

.passwords-table th {
    text-align: left;
    padding: 15px;
    background-color: #f5f5f5;
    font-weight: 600;
    color: #2C3E50;
    border-bottom: 2px solid #e9e9e9;
}

.passwords-table td {
    padding: 15px;
    border-bottom: 1px solid #e9e9e9;
    vertical-align: middle;
}

/* Corección de anchos para las columnas */
.passwords-table th:first-child,
.passwords-table td:first-child {
    width: 40%;
}

.passwords-table th:nth-child(2),
.passwords-table td:nth-child(2) {
    width: 40%;
}

.passwords-table th:last-child,
.passwords-table td:last-child {
    width: 20%;
}

.passwords-table tbody tr:hover {
    background-color: #f9f9f9;
}

/* Celdas de contraseña */
.password-cell {
    position: relative;
}

.password-display {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.masked-password {
    font-family: monospace;
    letter-spacing: 2px;
    flex-grow: 1;
}

.masked-password.revealed {
    letter-spacing: normal;
}

.password-actions {
    display: flex;
    gap: 8px;
    margin-left: 10px;
}

.view-password-btn,
.copy-password-btn {
    background: none;
    border: none;
    color: #777;
    cursor: pointer;
    font-size: 16px;
    padding: 5px;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.view-password-btn:hover,
.copy-password-btn:hover {
    color: #4CA1AF;
}

/* Botones de acciones */
.actions-cell {
    text-align: center;
}

.action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
}

.edit-btn,
.delete-btn {
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    transition: background 0.2s;
}

.edit-btn {
    background: #f5f5f5;
    color: #555;
    border: 1px solid #ddd;
}

.edit-btn:hover {
    background: #e9e9e9;
}

.delete-btn {
    background: #ffebee;
    color: #e74c3c;
    border: 1px solid #ffd0d5;
}

.delete-btn:hover {
    background: #ffd0d5;
}

.navbar-brand {
    max-width: 1200px;
    margin: 0 auto;
}

.brand-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
    margin: 0;
    background: linear-gradient(to right, #ffffff, #f0f0f0);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Ajustes para el dashboard-header */
.dashboard-header h2 {
    font-size: 1.5rem;
    color: #2C3E50;
    font-weight: 600;
    margin: 0;
}

/* Ajustar el padding del dashboard-container */
.dashboard-container {
    min-height: 100vh;
    padding-top: 0;
}

/* Responsive adaptations */
@media (max-width: 768px) {
    .top-menu {
        flex-direction: column;
        gap: 15px;
        padding: 15px;
    }

    .menu-actions {
        width: 100%;
        flex-wrap: wrap;
        justify-content: space-between;
    }

    .search-container {
        width: 100%;
        min-width: unset;
        order: -1;
        margin-bottom: 10px;
    }

    .action-buttons {
        flex-direction: row;
    }
    
    .passwords-table th:first-child,
    .passwords-table td:first-child {
        width: 30%;
    }
    
    .passwords-table th:nth-child(2),
    .passwords-table td:nth-child(2) {
        width: 30%;
    }
    
    .passwords-table th:last-child,
    .passwords-table td:last-child {
        width: 40%;
    }
}
</style>