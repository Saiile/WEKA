<script setup lang="ts">
    const { openServerbox } = useChatbox();

    const { joinedServers, refreshJoinedServers } = useServers();
    await refreshJoinedServers();

</script>

<template>

    <div class="serverWrapper">
        <div class="serverContainer">
            <button v-for="s in joinedServers" @click="openServerbox(s)">
                <img src="~assets/icon/emoji.png" alt="server">
                <p>{{ s.name }}</p>
            </button>
        </div>
    </div>

</template>

<style scoped>

    .serverWrapper{
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        z-index: 1;
        pointer-events: none;

    }

    .serverContainer{
        display: flex;
        align-content: flex-start;
        justify-content: space-evenly;
        flex-wrap: wrap;
        height: 70vh;
        width: 100%;
        overflow: auto;
        gap: 1vw;
    }

    .serverContainer button{
        border: 0;
        background-color: transparent;
        font-family: HomeVideo;
        pointer-events: auto;
        height: fit-content;
        width: fit-content;
    }

    .serverContainer button img{
        width:5vw;
    }

    .serverContainer button p{
        font-size: 0.8vw;
    }

</style>