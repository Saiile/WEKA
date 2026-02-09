import type { FastifyInstance } from "fastify";
import { prisma } from "../prismaClient.js";
import { broadcastMessage } from "../websocket/ws.js";

export async function messageRoutes(fastify: FastifyInstance) {
    
    // route get 
    fastify.get('/channels/:channelId/messages', async (request, reply) => {

        const { channelId } = request.params as { channelId: string }
        const { limit } = request.query as { limit?: string}

        try{
            const messages = await prisma.messages.findMany({
                where: {
                    channel_id: BigInt(parseInt(channelId))
                },
                include: {
                    users:{
                        select: {
                            id: true,
                            username: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'asc'
                },
                take: limit ? parseInt(limit) : 50
            })

            return { messages }
        }catch(error: any){
            console.error('Error try to find urself', error)
            reply.code(500).send({error: error.message})
        }
    })

    // route post

    fastify.post('/channels/:channelId/messages', async (request, reply )=>{
        
        const { channelId } = request.params as { channelId: string}
        const { content } = request.body as {content: string}

        try{
            await request.jwtVerify()
            const userId = (request.user as any).id

            if(!userId){
                return reply.code(401).send({ error: 'unauthorized'})
            }
            const message = await prisma.messages.create({
                data:{
                    channel_id: BigInt(parseInt(channelId)),
                    user_id: BigInt(userId),
                    content: content.trim()
                },
                include: {
                    users: {
                        select:{
                            id: true,
                            username: true
                        }
                    }
                }
            })

            broadcastMessage(parseInt(channelId), {
                type: 'new_message',
                message:message
            })

            return { message }
        }catch(error: any){
            if(error.statusCode === 401){
                return reply.code(401).send({ error : 'invalid token'})
            }
            console.error('Error creating msg', error)
            reply.code(500).send({ error: error.message })
        }
    })

    // delete

    fastify.delete('/messages/:messageId', async (request, reply) =>{
        const { messageId } = request.params as { messageId: string}

        try{
            await request.jwtVerify()
            const userId = (request.user as any).id

            if(!userId){
                return reply.code(401).send({ error: 'unauthorized'})
            }
            const message = await prisma.messages.findUnique({
                where: {
                    id: BigInt(parseInt(messageId))
                }
            })

            if(!message || Number(message.user_id) !== userId){
                return reply.code(403).send({ error: 'u cant do this'})
            }

            const channelId = Number(message.channel_id)

            await prisma.messages.delete({
                where: {
                    id: BigInt(parseInt(messageId))
                }
            })

            broadcastMessage(channelId, {

                type: 'message_deleted',
                messageId: parseInt(messageId)
            })
            
            return { success: true }
        } catch(error: any){
            console.error('Error deleting', error)
            reply.code(500).send({ error: error.message})
        }
    })
}