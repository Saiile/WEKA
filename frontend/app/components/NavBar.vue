<script setup lang="ts">
    const { newChatbox, closeAll, openUserbox, openCreatebox } = useChatbox();
    const { isServerCreated, refreshIsServerCreated } = useServers();
    const { logout } = apiAuth();
    refreshIsServerCreated();
</script>

<template>
    <div class="navContainer">
        <nav class="pixel-corners">
            <button @click="openUserbox">My account</button>
            <button v-if="!isServerCreated" @click="openCreatebox">Create server</button>
            <button v-if="isServerCreated">My server</button>
            <button @click="closeAll">Close all</button>
            <button @click="logout">Logout</button>
        </nav>
    </div>
</template>

<style scoped>
    .navContainer{
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: start;
        align-items: center;
    }

    nav{
        width: 10vw;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-self: center;
        max-height: 100vh;
        height: 70vh;
    }

    nav button{
        background-color: white;
        border: none;
        padding: 3vh;
        font-family: HomeVideo;
        font-size: 1.5vh;
        height: 100%;
        transition: 0.3s all;
    }

    nav button:hover{
        background-color: black;
        color: white;
        font-size: 2vh;
        padding: 5vh;
    }
</style>
