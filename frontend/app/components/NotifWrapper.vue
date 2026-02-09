<script setup lang="ts">
    const { notifs } = useNotif();
</script>

<template>
    <div class="notifWrapper">
        <TransitionGroup name="notif">
            <NotifItem v-for="n in notifs" :key="n.id" :notif="n"/>
        </TransitionGroup>
    </div>
</template>

<style scoped>
    .notifWrapper{
        width: 100vw;
        height: 100vh;

        position: fixed;
        top:0;
        left: 0;
    
        display: flex;
        flex-direction: column;
        justify-content: end;
        align-items: end;

        gap: 10px;
        padding: 10px;

        box-sizing: border-box;

        pointer-events: none;
        z-index: 99999999999999999999999999999999999;
    }

    .notif-enter-active {
        animation: slide-left 0.3s ease-out forwards;
    }

    .notif-leave-active {
        animation: slide-right 0.3s ease-in forwards;
    }

    .notif-move {
        transition: transform 0.3s ease;
    }
</style>