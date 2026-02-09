import type { FastifyInstance } from "fastify";
import { prisma } from "../prismaClient.js"

export async function channelRoute(fastify: FastifyInstance) {

    // POST crée un channel

    fastify.post('/servers/:serverId/channels', async(request, reply)=>{
        const { serverId } = request.params as { serverId: string }
        const { channel_name } = request.body as { channel_name: string }

        try{
            await request.jwtVerify()
            const userId = (request.user as any).id

            if(!userId){
                return reply.code(401).send({ error: 'unauthorized' })
            }

            if(!channel_name || !channel_name.trim()){
                return reply.code(400).send({ error: 'A name is required' })
            }

            // verif server existe
            const server = await prisma.servers.findUnique({
                where: {
                    id: BigInt(parseInt(serverId))
                }
            })

            if(!server){
                return reply.code(404).send({ error: 'server not found' })
            }
            
            // Création du channel

            const channel = await prisma.channels.create({
                data: {
                    channel_name: channel_name.trim(),
                    server_id: BigInt(parseInt(serverId))
                }
            })

            return reply.code(201).send({ 
                message: 'channel created',
                channel
            })
        } catch(error: any){
            if(error.statusCode === 401){
                return reply.code(401).send({ error: 'invald token' })
            }
            reply.code(500).send({ error: error.message})
        }
    })

    // GET liste des channels 

    fastify.get('/servers/:serverId/channels', async (request, reply) =>{
        const { serverId } = request.params as { serverId: string}
        
        try {
            const server = await prisma.servers.findUnique({
                where:{
                    id:BigInt(parseInt(serverId))
                }
            })

            if(!server){
                return reply.code(404).send({ error: 'Server not found'})
            }

            // recup channels
            const channels = await prisma.channels.findMany({
                where:{
                    server_id: BigInt(parseInt(serverId))
                },
                orderBy: {
                    created_at: 'asc'
                }
            })
            return { channels } 
        } catch(error : any){
            reply.code(500).send({ error: error.message })
        }
    })

    // GET détails channels

    fastify.get('/channels/:id', async (request, reply)=>{
        const { id } = request.params as { id: string }

        try{
            const channel = await prisma.channels.findUnique({
                where: {
                    id: BigInt(parseInt(id))
                },
                include: {
                    servers: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            })

            if(!channel){
                return reply.code(404).send({ error : 'Channel not found'})
            }
            return { channel }
        } catch(error: any){
            reply.code(500).send({ error: error.message})
        }
    })

    // PUT MAJ channel

    fastify.put('/channels/:id', async (request, reply)=>{
        const { id } = request.params as { id: string }
        const { channel_name } = request.body as { channel_name?: string} 

        try{
            await request.jwtVerify()
            const userId = (request.user as any).id

            if(!userId){
                return reply.code(401).send({ error: 'unauthorized' })
            }

            if(!channel_name){
                return reply.code(400).send({
                    error: 'Missing Channel name'
                })
            }

            const existingChannel = await prisma.channels.findUnique({
                where:{
                    id: BigInt(parseInt(id))
                }
            })

            if(!existingChannel){
                return reply.code(404).send({ error: 'Channel not found' })
            }

            const channel = await prisma.channels.update({
                where: {
                    id: BigInt(parseInt(id))
                },
                data: { 
                    channel_name : channel_name.trim()
                }
            })

            return { message: 'Channel successfully updated', channel}
        } catch(error: any){
            if(error.statusCode === 401){
                return reply.code(401).send({ error: 'invalid token' })
            }
            reply.code(500).send({ error: error.message})
        }
    })

    // DELETE delete channels

    fastify.delete('/channels/:id', async(request, reply)=>{
        const { id } = request.params as { id: string }

        try{
            await request.jwtVerify();
            const userId = (request.user as any).id

            if(!userId){
                return reply.code(401).send({ error: 'unauthorized' })
            }

            const channel = await prisma.channels.findUnique({
                where: {
                    id: BigInt(parseInt(id))
                }
            })

            if(!channel){
                return reply.code(404).send({ error: 'Channel not found'})
            }

            await prisma.channels.delete({
                where:{
                    id: BigInt(parseInt(id))
                }
            })

            return { success: true, message: 'Channel successfully deleted'}
        } catch (error : any){
            if(error.statusCode === 401){
                return reply.code(401).send({ error: 'invalid token' })
            }
            reply.code(500).send({ error: error.message})
        }
    })

}