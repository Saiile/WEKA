type Chatbox = {
    id: number;
    name: string;
    zIndex: number;
    type: string;
    server?: Server;
    channelId?: number;
}


const chatboxes = ref<Chatbox[]>([]);


export function useChatbox(){
  const config = useRuntimeConfig();
  const API_URL = config.public.apiUrl;


  function maxZindex(): number{
    if(chatboxes.value.length == 0) return 1;
    let maxZindex = 0;
    
    for(const cb of chatboxes.value){
      if(cb.zIndex > maxZindex){
        maxZindex = cb.zIndex;
      }
    }
    return maxZindex + 1;
  }
  
  
  function maxId(): number{
    if(chatboxes.value.length == 0) return 0;
    
    let maxId = 0  
    for(const cb of chatboxes.value){
      if(cb.id > maxId){
        maxId = cb.id;
      }
    }
    return maxId;
  }

  function newChatbox(name: string): void{
    chatboxes.value.push({id: maxId() + 1, name: name, zIndex: maxZindex() + 1, type: "server"});
  }

  async function openServerbox(server: Server): Promise<void>{
    const channelId = await getOrCreateChannel(server.id)
    chatboxes.value.push({id: maxId() + 1, name: server.name, zIndex: maxZindex() + 1, type: "server", server, channelId});
  }

  function openUserbox(): void{
    chatboxes.value.push({id: maxId() + 1, name: "My account", zIndex: maxZindex() + 1, type: "user"});
  }

  function openCreatebox(): void{
    chatboxes.value.push({id: maxId() + 1, name: "Create your server", zIndex: maxZindex() + 1, type: "create"});
  }

  function putOnTop(id: number): void{
    const chatbox = chatboxes.value.find(cb => cb.id === id);
    if(chatbox){
      chatbox.zIndex = maxZindex() + 1;
    }
  }

  function closeChatbox(id: number): void{
    const index = chatboxes.value.findIndex(chatboxe => chatboxe.id === id);
    if (index !== -1) {
      chatboxes.value.splice(index, 1);
    }
  }
  
  function closeAll(): void{
    chatboxes.value.splice(0, chatboxes.value.length);

  }

    async function getOrCreateChannel(serverId: number): Promise<number> {
    // recup les channels du serveur
    const res = await fetch(`${API_URL}/servers/${serverId}/channels`, {
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch channels for server ${serverId}`);
    }
    const data = await res.json() as { channels: { id: number; channel_name: string }[] };

    const firstChannel = data.channels[0];
    if (firstChannel) {
      return firstChannel.id; 
    }

    // crée un channel General
    const createRes = await fetch(`${API_URL}/servers/${serverId}/channels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ channel_name: "General" }),
    });
    if (!createRes.ok) {
      throw new Error(`Failed to create channel for server ${serverId}`);
    }
    const created = await createRes.json() as { channel: { id: number } };
    return created.channel.id;
  }


  return {
    chatboxes,
    newChatbox,
    putOnTop,
    closeChatbox,
    closeAll,
    maxZindex,
    openUserbox,
    openCreatebox,
    openServerbox
  }
}