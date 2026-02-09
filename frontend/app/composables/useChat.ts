export function UseChannelChat({chatbox}: UseChannelChat){
    const config = useRuntimeConfig();
    const API_URL = config.public.apiUrl;
    
    const messages = ref<Message[]>([]);
    const messageInput = ref('');
    const isLoading = ref(false);
    const isConnected = ref(false);
    
    // user is typing or not
    const usersTyping = ref<Set<string>>(new Set());
    const typingTimeout = ref<NodeJS.Timeout | null>(null);

    const onlineUsers = ref<{ userId: number; username: string }[]>([]);

    const messageContainer = ref<HTMLElement | null>(null);

    let ws:WebSocket | null = null;

    const { currentUser, fetchCurrentUser } = apiAuth();
    const currentUserId = computed(() => currentUser.value?.id ?? null);
    const currentUsername = computed(() => currentUser.value?.username ?? null);

    const channelId = ref((chatbox as any).channelId)
    
    const typingText = computed(() => {
        const typing = Array.from(usersTyping.value);
        if (typing.length === 0) return '';
        if (typing.length === 1) return `${typing[0]} is typing...`;
        if (typing.length === 2) return `${typing[0]} and ${typing[1]} are typing...`;
        return `${typing.length} people are typing...`;
    });

    onMounted(async()=>{
        if (chatbox.type !== 'server'){
            return
        }

        await fetchCurrentUser()
        if (!currentUser.value) {
        console.log('user not load')
        return
        }

        await loadMessages()
        connectWebSocket()
        scrollToBottom()
    })

    onUnmounted(()=>{
        if(ws){
            ws.close()
        }
    })

    // load l'historique des messages
    async function loadMessages() {
    isLoading.value = true;
    try {
        const response = await fetch(`${API_URL}/channels/${channelId.value}/messages`);
        
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json() as MessagesResponse;
        messages.value = data.messages || [];
    } catch (error) {
        console.log('error load msg:', error);
    } finally {
        isLoading.value = false;
    }
    }

    // Connexion WebSocket
    function connectWebSocket() {
        if (!currentUserId.value || !currentUsername.value) {
            console.log('Cant connect WebSocket: user not load');
            return;
        }

    ws = new WebSocket(
        `ws://localhost:8080/ws/channels/${channelId.value}?userId=${currentUserId.value}&username=${currentUsername.value}`
    );

    ws.onopen = () => {
        console.log('WS connected');
        isConnected.value = true;
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data) as WebSocketMessage


        switch (data.type) {
        case 'new_message':
            if (data.message) {
            const messageId = data.message.id;
            if (!messages.value.find(m => m.id === messageId)) {
                messages.value.push(data.message);
                nextTick(() => scrollToBottom());
            }
            }
            break;

        case 'message_deleted':
            if(data.messageId !== undefined){
                messages.value = messages.value.filter(m => m.id !== data.messageId);
            }
            break;

        case 'user_connected':
            messages.value.push({
                id: Date.now(),
                content: `${data.username} has join the channel`,
                created_at: new Date().toISOString(),
                users: null
            })
            nextTick(() => scrollToBottom());
            break;

        case 'user_disconnected':
            messages.value.push({
                id: Date.now(),
                content: `${data.username} has left the channel`,
                created_at: new Date().toISOString(),
                users: null
            })
            nextTick(() => scrollToBottom());
            console.log(`${data.username} disconnected`);
            break;

        case "user_typing":
            if (data.username && data.username !== currentUsername.value) {
            usersTyping.value.add(data.username);
            }
            break;

        case "user_stop_typing":
            if (data.username) {
            usersTyping.value.delete(data.username);
            }
            break;

        case 'connected_users':
            if (data.users) {
                onlineUsers.value = data.users;
            }
            break;
        }
    };

    ws.onerror = (error) => {
        console.error('websocket error', error);
    };

    ws.onclose = () => {
        console.log('ws disconnected');
        isConnected.value = false;
    };
    }


    function handleInput() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    //  user "typing"
    ws.send(JSON.stringify({ type: 'typing' }));

    // Clear 
    if (typingTimeout.value) {
        clearTimeout(typingTimeout.value);
    }

    // apres 1s "stop_typing"
    typingTimeout.value = setTimeout(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'stop_typing' }));
        }
    }, 1000);
    }

    // Envoyer un message
    async function hSubmit(event: Event) {
    event.preventDefault();

    if (!messageInput.value.trim()) {
        return;
    }

    const content = messageInput.value.trim()
    messageInput.value =''

    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'stop_typing' }));
    }
    if (typingTimeout.value) {
        clearTimeout(typingTimeout.value);
    }

    try {
        const response = await fetch(`${API_URL}/channels/${channelId.value}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            content: content,
        })
        });

            if (!response.ok) {
        throw new Error(`error: ${response.status}`);
        }

        const data = await response.json();

        nextTick(() => scrollToBottom());
    } catch (error) {
        console.log('Error sending msg', error);
        messageInput.value = content
    }}

    // Supprimer un message
    async function deleteMessage(messageId: number) {
    try {
        const response = await fetch(`${API_URL}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
        });

        if (response.ok) {
        messages.value = messages.value.filter(m => m.id !== messageId);
        }
    } catch (error) {
        console.log('Error:', error);
    }
    }
    // Scroll vers le bas
    function scrollToBottom() {
    if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
    }

    // Formater l'heure
    function formatTime(date: string) {
        return new Date(date).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    async function changeChannel(newChannelId: number){
        
        if(ws){
            ws.close();
            ws =null;
        }
        
        messages.value = [];
        usersTyping.value.clear();
        messageInput.value = '';
        isConnected.value = false;

        if (typingTimeout.value) {
            clearTimeout(typingTimeout.value);
            typingTimeout.value = null;
        }

        channelId.value = newChannelId;
        (chatbox as any).channelId = newChannelId;
    
        await loadMessages();
        connectWebSocket();
        nextTick(()=>scrollToBottom())
    }

    return {
        messages,
        messageInput,
        isLoading,
        isConnected,
        typingText,
        messageContainer,
        handleInput,
        hSubmit,
        onlineUsers,
        deleteMessage,
        scrollToBottom,
        formatTime,
        changeChannel,
    }

}