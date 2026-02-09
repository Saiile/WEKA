export function UseChannels(serverId: number){
  const config = useRuntimeConfig();
  const API_URL = config.public.apiUrl;

  
  const channels = ref<{ id: number; channel_name: string }[]>([]);
  const isLoading = ref(false);

  async function loadChannels(){
    isLoading.value = true;
    try{
        const res = await fetch(`${API_URL}/servers/${serverId}/channels`, {
            credentials: 'include',
        });
        if(res.ok){
            const data = await res.json() as { channels : { id: number; channel_name: string }[] };
            channels.value = data.channels;
        }
    } catch(error){
        console.log('Error load channels', error)
    } finally{
        isLoading.value = false;
    }
  }

  async function createChannel(channelName : string): Promise<number | null>{
    try{
        const res = await fetch(`${API_URL}/servers/${serverId}/channels`,{
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({ channel_name : channelName }),
        });
        if(!res.ok){
            throw new Error('Failed to create channel');
        }

        const data = await res.json() as { channel: { id: number } }

        await loadChannels();
        return data.channel.id;
    }catch(error){
        console.log('Error creating channel', error);
        return null;
    }
  }

  onMounted(()=>{
    loadChannels();
  });

  return {
    channels,
    isLoading,
    loadChannels,
    createChannel,
  };
}