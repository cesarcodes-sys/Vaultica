<template>
    <div>
        <h3>Mis Contraseñas</h3>
        <ul>
            <li v-for="password in passwords" :key="password._id">
                <span>{{ password.service }}</span>
                <button @click="editPassword(password._id)">Editar</button>
                <button @click="deletePassword(password._id)">Eliminar</button>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    data() {
        return {
            passwords: [],
        };
    },
    async created() {
        await this.fetchPasswords();
    },
    methods: {
        async fetchPasswords() {
            try {
                const response = await this.$axios.get('/api/passwords/USER_ID'); // Reemplaza USER_ID con el ID del usuario
                this.passwords = response.data;
            } catch (error) {
                console.error('Error al obtener las contraseñas:', error);
            }
        },
        editPassword(id) {
            this.$router.push(`/edit-password/${id}`);
        },
        async deletePassword(id) {
            try {
                await this.$axios.delete(`/api/passwords/${id}`);
                await this.fetchPasswords();
            } catch (error) {
                console.error('Error al eliminar la contraseña:', error);
            }
        },
    },
};
</script>