<script setup lang="ts">
    const {createServer} = useServers();
    const name = ref<string>("");
</script>
<template>
    <form class="userForm" @submit.prevent="createServer(name)">
        <input type="text" placeholder="Name" v-model="name">
        <input type="submit" value="Create">
    </form>
</template>
<style scoped>
    .userForm{
        display: flex;
        flex-direction: column;
    }
</style>