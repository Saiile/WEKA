import type { FastifyInstance } from "fastify";
import type { WebSocket } from "@fastify/websocket";

interface Client {
    socket: WebSocket
    channelId : number
    userId: number
    username: string
}

// Map les user log par channel
const channelClients = new Map<number, Set<Client>>()

function BTC(channelId: number, message: any, excludeClient?: Client){
    const clients = channelClients.get(channelId)
    if(clients){
        const messagestr = JSON.stringify(message)
        clients.forEach(client =>{
            if(client !== excludeClient){
                try{
                    client.socket.send(messagestr)
                }catch(error){
                    console.log('error sending msg', error)
                }
            }
        })
    }
}

export function broadcastMessage(channelId: number, message: any){
    BTC(channelId, message)
}

function sendConnectedUsers(channelId: number) {
    const clients = channelClients.get(channelId);
    if (!clients) return;
    
    const usersList: { userId: number; username: string }[] = [];
    
    clients.forEach(client => {
        // Si pas userId on l'ajoute
        if (!usersList.find(user => user.userId === client.userId)) {
            usersList.push({
                userId: client.userId,
                username: client.username
            });
        }
    });
    
    BTC(channelId, {
        type: 'connected_users',
        users: usersList
    });
}

export async function chatWebSocket(fastify:FastifyInstance){
    
    fastify.get('/ws/channels/:channelId', { websocket : true }, (socket, request) =>{
        const { channelId } = request.params as { channelId: string }
        const {userId, username } = request.query as {userId: string; username: string }

        if(!userId || !username){
            socket.close(1008, 'Missing user id or username')
            return
        }

        const channelIdNum = parseInt(channelId)
        const userIdNum = parseInt(userId)

        const client: Client = {
            socket,
            channelId: channelIdNum,
            userId: userIdNum,
            username: username
        }

        // add client au channel
        if(!channelClients.has(channelIdNum)) {
            channelClients.set(channelIdNum!, new Set())
        }
        channelClients.get(channelIdNum)!.add(client)

        console.log(`${userIdNum}; ${username} : connected to channel ${channelIdNum}`)

        // notif qu'un user est co
        BTC(channelIdNum, {
            type: 'user_connected',
            userId: userIdNum,
            username: username
        })

        sendConnectedUsers(channelIdNum);

        socket.on('message', (data: Buffer) => {
        try {
            const payload = JSON.parse(data.toString())
            if(payload.type == 'typing'){
                BTC(channelIdNum, {
                    type: 'user_typing',
                    userId: userIdNum,
                    username: username
                }, client)
                return
            }

            if(payload.type === 'stop_typing') {
                BTC(channelIdNum, {
                    type: 'user_stop_typing',
                    userId: userIdNum,
                    username: username
                }, client)
                return
                }

            // Broadcaster à tout le monde
            BTC(channelIdNum, payload)
            
        } catch (error) {
            console.log('Error :', error)
        }
        })

        socket.on('close', () =>{
            const clients = channelClients.get(channelIdNum)
            if(clients){
                clients.delete(client)
                if(clients.size === 0){
                    channelClients.delete(channelIdNum)
                }
            }

            console.log(`${username} has leave the channel ${channelIdNum}`)

            BTC(channelIdNum,{
                type: 'user_disconnected',
                userId: userIdNum,
                username: username
            })

            sendConnectedUsers(channelIdNum)
        })

        socket.on('error', (error)=>{
            console.log('websocketError', error)
        })
    })
}