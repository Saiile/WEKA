<script setup lang="ts">
    const { chatboxes } = useChatbox();
</script>

<template>
    <div class="container">
        <div class="chatboxWrapper">
            <TransitionGroup name="popup">
                
                <ChatBox
                    v-for="cb in chatboxes"
                    :key="cb.id"
                    :chatbox="cb"
                />
            </TransitionGroup>
        </div>
    </div>
</template>

<style scoped>
    .container{
        width: 100vw;
        height: 100vh;

        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 1;
    }
    
    .chatboxWrapper{
        width: 100vw;
        height: 100vh;

        position: relative;
        pointer-events: none;
    }

    .popup-enter-active {
    animation: popupIn 0.3s ease-out forwards;
    }

    /* sortie */
    .popup-leave-active {
    animation: popupOut 0.15s ease-in forwards;
    }
</style>