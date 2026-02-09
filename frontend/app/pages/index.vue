<script setup lang="ts">
    definePageMeta({
        middleware: 'auth-root'
    })
    const entered = ref<boolean>(false);
</script>

<template>
    <div class="container">   
        <div class="joinContainer" v-if="!entered" >
            <img 
                src="~/assets/logo/newLogo.png"
                @click="entered = true" 
            />
            <p>Click to join</p>
        </div>

        <AuthForm v-if="entered"/>

    </div>


</template>

<style scoped>
    .container{
        width: 100vw;
        height: 100vh;

        display: flex;
        justify-content: center;
        align-items: center;    

        flex-direction: column;
        
        background-size: 40px 40px;
        background-image:
            linear-gradient(to right, rgba(141, 141, 141, 0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(141, 141, 141, 0.25)1px, transparent 1px);

    }

    .joinContainer{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .container img{
        cursor: pointer;
        transition: 0.15s all;
        width: 50%;
    }

    .container img:hover{
        scale: 1.1;
    }

    .container img:active{
        scale: 0.9;
    }
</style>
