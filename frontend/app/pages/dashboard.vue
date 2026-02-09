<script setup lang="ts">
    definePageMeta({
        middleware: 'auth'
    })
</script>
<template>
    
    <div class="dashboard">
        <NavBar/>
        <ServerWrapper/>
        <ServersList/>
        <ChatBoxWrapper />
    </div>
</template>

<style scoped>
    .dashboard{
        display: grid;
        grid-template-columns: 1fr 2fr 1fr;
        width: 100vw;
        height: 100vh;
        background-size: 40px 40px;
        background-image:
            linear-gradient(to right, rgba(141, 141, 141, 0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(141, 141, 141, 0.25)1px, transparent 1px);

        padding: 2%;
        box-sizing: border-box;
    }
    
    .dashboard::before {
    content: "WEKA";
    position: absolute;
    inset: 0;

    display: flex;
    justify-content: center;
    align-items: center;

    font-size: 10rem;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.268);

    pointer-events: none;
    }

    .titleContainer{
        position: fixed;
        top:0;
        left:0;
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;

        font-size:10em;
        pointer-events: none;
        z-index: 2;
    }
</style>
