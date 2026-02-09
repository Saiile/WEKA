<script setup lang="ts">

const { myServer, getUsers } = useServers()
const {apiAcceptUser, apiBanUser, apiKickUser } = apiServers();

const server = ref<Server>();
const users1 = ref<User[]>(await getUsers(29, 1));
const users0 = ref<User[]>(await getUsers(29, 0));
const users2 = ref<User[]>(await getUsers(29, 2));
</script>

<template>

    <!-- <p v-if="server">{{ server.name }}</p> -->
    <div class="cnt">
        <div>
            <p>Pending</p>
            <p v-for="u in users0" @click="apiAcceptUser(29, u.user_id)">{{ u.username }}</p>
        </div>
        <div>
            <p>Accepted</p>
            <p v-for="u in users1" @click="apiBanUser(29, u.user_id)">{{ u.username }}</p>
        </div>
        <div>
            <p>Banned</p>
            <p v-for="u in users2" @click="apiKickUser(29, u.user_id)">{{ u.username }}</p>
        </div>
    </div>

</template>

<style scoped>
    .cnt{
        display: flex;
        justify-content: space-evenly;
    }

    .cnt div{
        width: 100%;
        border: 1px solid black;
    }

    .cnt div p{
        width: 100%;
        text-align: center;
    }
</style>