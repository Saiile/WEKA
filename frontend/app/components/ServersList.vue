<script setup lang="ts">
    const { allServers, refreshAllServers, joinServer} = useServers();
    const { addNotif } = useNotif();

    await refreshAllServers()
</script>

<template>
  <div class="serverListWrapper">
    <div class="serverListContainer pixel-corners">
        <p>Servers</p>
        <div class="serverList">
            <button v-for="s in allServers" :key="s.id" @click="joinServer(s)">
                {{ s.name }}
                <p>Click to join</p>
            </button>
        </div>
        <button @click="refreshAllServers" class="refreshButton">Refresh server's list</button>
    </div>
  </div>
</template>

<style scoped>
    .serverListWrapper{
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: end;
        align-items: center;
    }

    .serverListContainer{
        width: 10vw;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        align-self: center;
        max-height: 100vh;
        height: 70vh;
        background-color: white;
    }

    .serverListContainer p{
        font-size: 1.2vw;
        padding: 0.5vw;
        border-bottom: 3px solid black;
    }

    .serverList{
        box-sizing: border-box;
        width: 100%;
        height:100%;
        overflow: auto;
        scrollbar-width: none; 
        -ms-overflow-style: none; 
    }

    .serverList button{
        width: 100%;
        padding: 2vh;
        border: none;
        background-color: transparent;
        font-family: HomeVideo;
        font-size: 1.5vh;
        transition: 0.3s all;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .serverList button:hover{
        background-color: black;
        color: white;
        font-size: 2vh;
        padding: 5vh;
    }

    .serverList button p{
        font-size: 0.5vw;
        border: none;
    }

    .refreshButton{
        background-color: white;
        border: 0px solid black;
        font-family: HomeVideo;
        font-size: 0.8vw;
        padding: 2vh;
    }
</style>