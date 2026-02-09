<script setup lang="ts">
defineProps<{
    open: boolean
}>()

const emit = defineEmits<{
    (e: 'cancel'): void
    (e: 'confirm'): void
    }>()
</script>

<template>

    <div v-if="open" class="backdrop" @click.self="emit('cancel')">
        <div class="box1">
        <br><br>
        <div>Are you sure you want to delete your account ?</div><br>
        <div class="actions">
            <input type="button" value="Cancel" @click="emit('cancel')" />
            <input type="button" value="Delete" @click="emit('confirm')" style="color: white; background-color: red; font-weight: bold;"/>

        </div><br>
        <img src="~/assets/icon/sad-emoji.png"/>
        </div>
    </div>

</template>

<style scoped>
    
    .box1{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

        .actions{
        
        display: flex;
     
        justify-content: center;
        align-items: center;
    }

    
</style>
