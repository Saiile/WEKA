export {}

declare global {
  
  interface Server {
    id: number
    name: string
    owner_id?: number
  }

  interface Result{
    success: boolean
    message: string
    user?: {
      id:number
      username: string
      email: string
    }
  }

  interface Message {
    id: number 
    content: string
    created_at: string
    channel_id?: number 
    user_id?: number 
    users: {
      id: number 
      username: string
    } | null
  }

  interface MessagesResponse {
    messages: Message[];
}

  interface WebSocketMessage {
    type: 'new_message' | 'message_deleted' | 'user_connected' | 'user_disconnected' | 'connected_users' | 'user_typing' | 'user_stop_typing';
    message?: Message;
    messageId?: number;
    userId?: number;
    username?: string;
    users?: { userId: number; username: string }[];
  }

  interface serverDetails{
    name: string
    owner: string
    users_count: number
  }

  interface Chatboxx{
    id: number
    name: string
    type: string
    server?: Server
  }

  interface UseChannelChat{
      chatbox : Chatboxx
  }
  interface User{
    id: number,
    user_id: number,
    username: string,
    status: number,
    role: string,
  }
}
