import { ref } from 'vue';
<script setup lang="ts">
const props = defineProps<{
  chatbox: {
    id: number;
    name: string;
    zIndex: number;
    type: string;
    server?: Server;
    channelId?:number
  };
}>();

const { putOnTop, closeChatbox } = useChatbox();
const {apiGetChannels} = apiServers();

let channels;

if(props.chatbox.type == "server" && props.chatbox.server?.id){
  const server_id: number = props.chatbox.server?.id; 
  channels = await apiGetChannels(server_id);
}

// Position et drag
const x = ref<number>(500);
const y = ref<number>(10);
const headerx = ref<number>(0);
const headery = ref<number>(0);
const down = ref<boolean>(false);

const noteElement = ref<HTMLElement | null>(null);
const header = ref<HTMLElement | null>(null);



// Fonctions de drag
function mouseDown(event: MouseEvent) {
  down.value = true;
  const rect = noteElement.value!.getBoundingClientRect();
  headerx.value = event.clientX - rect.left;
  headery.value = event.clientY - rect.top;
  window.addEventListener('mousemove', mouseMove);
  window.addEventListener('mouseup', mouseUp);
  putOnTop(props.chatbox.id);
}

function mouseUp() {
  down.value = false;
  window.removeEventListener('mousemove', mouseMove);
  window.removeEventListener('mouseup', mouseUp);
}

function mouseMove(event: MouseEvent) {
  if (!down.value) return;
  x.value = event.clientX - headerx.value;
  y.value = event.clientY - headery.value;
}

// WS, messages, typing
const {
  messages,
  messageInput,
  typingText,
  messageContainer,
  handleInput,
  onlineUsers,
  hSubmit,
  formatTime,
  changeChannel,
} = UseChannelChat({
  chatbox: props.chatbox as any,
});

function handleChannelSelect(channelId: number) {
  changeChannel(channelId);
}

const {apiAcceptUser, apiBanUser, apiKickUser, leaveServer, apiUserRole, apiUser, getServerDetails, getOwnerId, updateServer, deleteServer, apiUserUpdateRole} = apiServers();
const { myServer, getUsers, refreshAllServers, refreshJoinedServers } = useServers()

const pendingUsers = ref<User[]>();
const acceptedUsers = ref<User[]>();
const bannedUsers = ref<User[]>();
const server_id = ref<number>(0);
const userRole = ref<string>("");
const isUserOwner = ref<boolean>(false);
const owner_id = ref<number>();
const newName = ref<string>(props.chatbox.name);
  async function refreshServers(){
    await new Promise(r => setTimeout(r, 500));
    refreshAllServers();
    refreshJoinedServers();
  }

  async function refreshUsers(){
    if(props.chatbox.type == 'server' && props.chatbox.server?.id){
      const userData = await apiUser();
      const serverDetails = await getOwnerId(props.chatbox.server.id);
      owner_id.value = serverDetails;
      if(serverDetails == userData.id){
        isUserOwner.value = true;
      }

      server_id.value = props.chatbox.server.id;
      const id = props.chatbox.server.id
      userRole.value = await apiUserRole(id);
      await new Promise(r => setTimeout(r, 500));

      bannedUsers.value = await getUsers(id, 2);
      acceptedUsers.value = await getUsers(id, 1);
      pendingUsers.value = await getUsers(id, 0);

      console.log("owner : " + isUserOwner.value);
    }
  } 

refreshUsers();

const isPanelOpen = ref<boolean>(false);
const usersPanel = ref<boolean>(false);
const paramsPanel = ref<boolean>(false);

  function openPanel(panel:string) {
    if(panel == 'chats'){
      isPanelOpen.value = false;
      paramsPanel.value = false;
      usersPanel.value = false;
      return;
    } else{
      isPanelOpen.value = true;
      if(panel == 'users'){
        paramsPanel.value = false;
        usersPanel.value = true;
        return;
      } else if(panel == 'params'){
        usersPanel.value = false;
        paramsPanel.value = true;
        return;
      }
    }
}

</script>
<template>
  <div
    class="chatboxContainer pixel-corners" :style="{ left: x + 'px', top: y + 'px', zIndex: chatbox.zIndex }"ref="noteElement">
    <div class="topContainer" @mousedown="mouseDown" ref="header">
      <p class="serverName">{{ chatbox.name }}</p>
      <button @click="closeChatbox(chatbox.id)" class="animBtn">Close</button>
    </div>

    <div class="paramServer" v-if="props.chatbox.type === 'server'">
       <button @click="openPanel('chats')" class="animBtn">Chats</button> 
       <button @click="openPanel('users')" v-if="userRole == 'Admin'" class="animBtn">Users</button> 
       <button @click="openPanel('params')" v-if="userRole == 'Admin' || userRole == 'Mod'" class="animBtn">Parameters</button> 
       <button @click="leaveServer(server_id); refreshServers(); closeChatbox(chatbox.id)" v-if="!isUserOwner" class="animBtn">Leave server</button>
    </div>

 <div v-if="usersPanel" class="messageContainer usersList" >
      
      <button @click="refreshUsers()" style="width: 100%;" class="animBtn">Refresh list</button>

      <!-- Pending -->
      <div class="userContainer">
        <p>Pending</p>
        <p v-if="pendingUsers?.length == 0">none</p>
        <div v-for="u in pendingUsers">
          {{ u.username }} 
          <button @click="apiAcceptUser(server_id, u.user_id), refreshUsers()" class="animBtn">Accept</button> 
          <button @click="apiBanUser(server_id, u.user_id), refreshUsers()" class="animBtn">Ban</button> 
          <button @click="apiKickUser(server_id, u.user_id), refreshUsers()" class="animBtn">Kick</button>
        </div>  
      </div>

      <!-- Accepted -->
      <div class="userContainer">
        <p>Accepted</p>
        <p v-if="acceptedUsers?.length == 0">none</p>
        <div v-for="u in acceptedUsers" class="userOption">
          {{ u.username }} <p>{{ u.role }}</p>
          <button @click="apiBanUser(server_id, u.user_id), refreshUsers()" v-if="u.user_id != owner_id" class="animBtn">Ban </button> 
          <button @click="apiKickUser(server_id, u.user_id), refreshUsers()" v-if="u.user_id != owner_id" class="animBtn">Kick</button>
          <button @click="apiUserUpdateRole(server_id, u.user_id, 'User'), refreshUsers()" v-if="u.user_id != owner_id && u.role != 'User'" class="animBtn">User</button>
          <button @click="apiUserUpdateRole(server_id, u.user_id, 'Mod'), refreshUsers()" v-if="u.user_id != owner_id && u.role != 'Mod'" class="animBtn">Mod</button>
          <button @click="apiUserUpdateRole(server_id, u.user_id, 'Admin'), refreshUsers()" v-if="u.user_id!= owner_id && u.role != 'Admin'" class="animBtn">Admin</button>

        </div>

      </div>

      <!-- Banned -->
      <div class="userContainer">
        <p>Banned</p>
        <p v-if="bannedUsers?.length == 0">none</p>
        <div v-for="u in bannedUsers">
          {{ u.username }} 
          <button @click="apiKickUser(server_id, u.user_id), refreshUsers()" class="animBtn">Unban (kick)</button>
        </div>
      </div>
    
    </div>

    <div v-if="paramsPanel" class="messageContainer params" >
      <input type="text" v-model="newName">
      <button @click="updateServer(server_id, newName); refreshServers()" class="animBtn">Rename server</button>
      <button @click="deleteServer(server_id); refreshServers(); closeChatbox(chatbox.id)" class="deleteServ" v-if="userRole == 'Admin'">Delete server</button>
    </div>

    <!-- type server -->
    <div v-if="chatbox.type === 'server' && !isPanelOpen" class="serverContentContainer">
      <div class="messageContainer" ref="messageContainer">
        <div v-for="message in messages" :key="message.id" class="messageCards">
          <template v-if="message.users">
            <strong>{{ `${formatTime(message.created_at)} ${message.users?.username}` }}: </strong> {{ message.content }}
          </template>
          <template v-else>
            <div>{{ `${formatTime(message.created_at)} ${message.content}` }}</div>
          </template>
        </div>
        <div v-if="typingText" class="typingText">
          {{ typingText }}
        </div>
      </div>

      <!-- online user lsit -->
      <div class="onlineUsersContainer">
        <h3>Online Users({{ onlineUsers.length }})</h3>
        <div v-for="user in onlineUsers" :key="user.userId" class="userItem">
          <p class="onlineIndicator"></p>
          {{ user.username }}
        </div>
      </div>
    </div>

    <!-- type user -->
    <div v-else-if="chatbox.type === 'user'" class="messageContainer">
      <UserForm />
    </div>

    <!-- type create -->
    <div v-else-if="chatbox.type === 'create'" class="messageContainer">
      <ServerForm />
    </div>

    <!-- liste des channels avec btn +-->
    <div v-if="chatbox.type === 'server' && chatbox.server" class="channelsContainer">
      <ChannelList
        :server-id="chatbox.server.id"
        :current-channel-id="chatbox.channelId"
        :userRole="userRole"
        @select-channel="handleChannelSelect"
      />
    </div>

    <!-- Message box -->
    <form
      v-if="chatbox.type === 'server'" class="formsContainer" @submit="hSubmit">
      <input class="pixel-corners" type="text" placeholder="enter a message..." v-model="messageInput" @input="handleInput"/>
      <button type="submit" class="animBtn">Send</button>
    </form>
  </div>
</template>

<style scoped>

  .paramServer{
    background-color: #f5f5f5;
    border-top: solid black;
    border-bottom: solid black;
  }

  .serverContentContainer {
    display: flex;
    flex-direction: row;
    flex: 1;
    overflow: hidden;
  }

  .onlineUsersContainer {
    width: 10vh;
    background-color: #f5f5f5;
    border-left: 3px solid black;
    padding: 10px;
    overflow-y: auto;
    flex-shrink: 0;
    height: 100%;
  }

  .onlineUsersContainer h3 {
    font-size: 1.5vh;
    margin-bottom: 10px;
    font-family: HomeVideo;
    border-bottom: 2px solid black;
    padding-bottom: 5px;
  }

  .userItem {
    display: flex;
    align-items: center;
    padding: 5px;
    margin-bottom: 5px;
    font-size: 12px;
    font-family: HomeVideo;
  }

  .onlineIndicator {
    width: 8px;
    height: 8px;
    background-color:rgb(6, 190, 6);
    border-radius: 50%;
    margin-right: 8px;
  }

  .channelsContainer{
    width: 100%;
    background-color: white;
    overflow-y: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .channelsContainer button{
    width: fit-content;
  }

  .userOption{
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .userOption p{
    margin: 1vw;
    font-size: 0.7vw;
    color:green;
    font-weight: bold;
  }
  .deleteServ{
    background-color: red;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s all;
  }

  .deleteServ:hover{
    scale: 0.9;
  }

  .chatboxContainer {
    position: absolute;
    width: 40vw;
    height: 60vh;
    max-height: 100vh;
    border: 5px solid black;
    background-color: white;
    pointer-events: auto;
    display: flex;
    flex-direction: column;

  }

  .typingText {
    margin-top: 8px;
    font-size: 12px;
    font-weight: bold;
    color: #444;

  }

  .topContainer{
    background-color: black;
    display: flex;
    justify-content: space-between;
    padding-left: 10px;
    padding-right: 10px;
    box-sizing: border-box;
    }

  .serverName{
    color: white;
    
  }

  .messageContainer{
    background-image: url('/bg/bgNoteBook.jpg');
    background-size: cover;
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    min-width: 0;
    scrollbar-width: none; 
    -ms-overflow-style: none; 
  }

  .messageCards {
    padding: 5px 10px;
    margin-bottom: 10px;
    background-color: #f1f1f1;
    border: 3px solid black;
    font-size: 12px;
    overflow-wrap: break-word;
    word-wrap: break-word;
  }

  .sendArrow{
    width: 30px;
    height: 30px;
  }

  .formsContainer{
    padding: 10px;
    display: flex;
    gap: 10px;
    background-color: black;
    flex-shrink: 0;
  }

  .formsContainer input{
    flex: 1;
    background-color: white;
    color: black;
    box-shadow: 10px 10px 34px -11px rgba(0,0,0,0.54) inset;
    -webkit-box-shadow: 10px 10px 34px -11px rgba(0,0,0,0.54) inset;
    -moz-box-shadow: 10px 10px 34px -11px rgba(0,0,0,0.54) inset;
  }


  input{
    background-color: white;
    border: 1px solid black;
    padding: 5px;
    margin: 5px;
    font-family: HomeVideo;
  }

  input[type="text"]:focus, input[type="password"]:hover{
    outline: 2px solid #8b6d9c;
  }

  input[type="submit"]{
    cursor: pointer;
    transition: 0.1s all;
  }

  input[type="submit"]:hover{
    scale: 0.9;
  }

  .animBtn{
    cursor: pointer;
    transition: 0.3s all;
  }

  .animBtn:hover{
    background-color: #ddd;
    scale: 0.9;
  }

  button{
    background-color: white;
    border: 1px solid black;
    padding: 5px;
    margin: 5px;
    font-family: HomeVideo;
  }

  button[type="submit"]{
    cursor: pointer;
  }
</style>