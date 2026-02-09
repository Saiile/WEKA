<script setup lang="ts">
    const props = defineProps({
        notif: {
            type: Object,
            required: true,
        }
    });
</script>

<template>
    <div class="notif pixel-corners" :class="notif.type">
        {{ notif.message  }}
    </div>
</template>

<style scoped>
    .notif{
        min-width: 200px;
        min-height: 50px;

        width: fit-content;
        height: fit-content;

        padding: 10px;

        box-sizing: border-box;
    }


    .success{
        background-color: white !important;
        color: black !important;
    }

    .error{
        background-color: black !important;
        color: white !important;
    }
</style>