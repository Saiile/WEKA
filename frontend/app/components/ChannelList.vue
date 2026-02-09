<script setup lang="ts">
import { UseChannels } from '~/composables/useChannels';

const props = defineProps<{
  serverId: number;
  currentChannelId?: number;
  userRole: string;
}>();

const emit = defineEmits<{
  (e: 'selectChannel', channelId: number): void;
}>();

const { channels, createChannel, loadChannels } = UseChannels(props.serverId);

const showCreateForm = ref(false);
const newChannelName = ref('');

async function handleCreateChannel() {
  if (!newChannelName.value.trim()) return;

  const channelId = await createChannel(newChannelName.value.trim());
  
  // ouvre le nv channel
  if (channelId) {
    newChannelName.value = '';
    showCreateForm.value = false;
    emit('selectChannel', channelId);  
  }
}
</script>

<template>
  <div class="channelsContainer">
    <div class="channelsList">
      <div v-for="channel in channels" :key="channel.id" class="channelItem">
        <button @click="emit('selectChannel', channel.id)" :class="{ active: channel.id === currentChannelId }">#{{ channel.channel_name }}</button>
      </div>
    </div>

    <!-- btn +  -->
    <div class="createChannel" v-if="userRole == 'Admin' || userRole == 'Mod'">
      <button v-if="!showCreateForm" @click="showCreateForm = true" class="addButton" >+</button>
      <div v-else class="createForm">
        <input v-model="newChannelName" @keyup.enter="handleCreateChannel" @keyup.esc="showCreateForm = false" placeholder="Nom du channel..." autofocus />
        <button @click="handleCreateChannel">create</button>
        <button @click="showCreateForm = false">cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

.channelsContainer {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 5px;
    gap: 5px;
    background-color: #f5f5f5;
    border-bottom: solid black;
    border-top: solid black;
}

.channelsList {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    display: flex;
    gap: 5px;
    scrollbar-width: none; 
    -ms-overflow-style: none; 
}

.channelItem {
    flex-shrink: 0;
}

.channelItem button {
    width: fit-content;
    padding: 5px;
    margin: 2px 0px 2px 5px;
    text-align: left;
    background-color: white;
    border: 1px solid black;
    font-family: HomeVideo;
    cursor: pointer;
    transition: 0.2s all;
}

.channelItem button:hover {
    scale: 0.9;
}

.channelItem button.active {
    background-color: #ddd;
    font-weight: bold;
    outline: 2px solid #8b6d9c;
}

.createChannel {
    flex-shrink: 0;
}

.createForm {
    display: flex;
    gap: 5px;
    align-items: center;
}

.createForm input {
    min-width: 150px;
    background-color: white;
    border: 1px solid black;
    padding: 5px;
    margin: 5px;
    font-family: HomeVideo;
}

.createForm input:focus {
    outline: 2px solid #8b6d9c;
}

.createForm button {
    background-color: white;
    border: 1px solid black;
    padding: 5px;
    margin: 5px;
    font-family: HomeVideo;
    cursor: pointer;
    transition: 0.2s all;
}

.createForm button:hover {
    scale: 0.9;
}

.addButton {
    width: 2.5vh;
    padding: 5px;
    margin-right: 10px;
    background-color: rgb(6, 190, 6);
    color: white;
    border: 1px solid black;
    font-family: HomeVideo;
    cursor: pointer;
    transition: 0.2s all;
}

.addButton:hover {
    scale: 0.9;
}
</style>