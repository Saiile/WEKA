import type { FastifyInstance } from 'fastify'
import { prisma } from '../prismaClient.js'
import { existsSync } from 'node:fs'
interface JwtPayload {
     id: number
     username: string
     email?: string
 }

export async function serverRoute(server: FastifyInstance) {

    // Récupèr touts les serveurs
    server.get('/getAllServers', async (request, reply) => {
  
        const servers = await prisma.servers.findMany({
            select:{
                id:true,
                name:true,
            }
        });
        return servers;
    });

    // Détails du serveur
    server.get<{Params: { id: number }}>('/server/:id', async (request, reply) => {
        const { id } = request.params;

        try{
            const serverDetails = await prisma.servers.findFirst({
                where: { id },
                select: {
                    name: true,
                    users:{
                        select:{
                            username:true,
                        }
                    },
                    _count: {
                        select: {
                            servermembers: true,
                        }
                    }
                }
            }); 

            if(serverDetails){
                return {name: serverDetails.name, owner: serverDetails.users.username, users_count: serverDetails._count.servermembers};
            }

        }catch(err){
            console.log(err);
        }
    });


    // ownerId
    server.get<{Params: { id: number }}>('/server/:id/owner', async (request, reply) => {
        const { id } = request.params;

        try{
            const owner = await prisma.servers.findFirst({
                where: { id },
                select: {
                    owner_id: true,
                }
            }); 
            return owner;  
        }catch(err){
            console.log(err);
        }
    });


    // Affiche les serveurs que l'utilisateur à rejoints
    server.get('/servers', async (request, reply) => {
        const token = request.cookies.token;
            
        if(!token){
            return {success: false, message: "You're not logged"};
        }

        const user = server.jwt.verify(token) as JwtPayload
        const user_id = user.id;
        const servers = await prisma.servers.findMany({
            select:{
                id:true,
                name:true,
            },
            where:{
                servermembers:{
                    some:{
                        user_id: user_id,
                        status: 1
                    }
                }
            }
        });

        return servers;
    });

    // Permet de créer un serveur
    server.post<{ Body: {name:string} }>('/servers', async (request, reply) => {
        const  server_name  = request.body.name;
        const token = request.cookies.token;
            
        if(!token){
            return {success: false, message: "You're not logged"};
        }

        const user = server.jwt.verify(token) as JwtPayload
        const user_id = user.id;
        
        try {    
            // Check if the row already exists
            const existing = await prisma.servers.findFirst({
                where: {
                    owner_id: user_id,
                }
            });

            if (existing) {
                return { success: false, message: 'You already created your server' };
            }


            // If not exists, create
            await prisma.servers.create({
                data: { name: server_name, owner_id: user_id }
            });

            const userServer = await prisma.servers.findFirst({
                select:{
                    id:true,
                },
                where:{
                    owner_id: user_id,
                }
            })

            if(userServer){
                await prisma.servermembers.create({
                    data:{
                        server_id: userServer.id,
                        user_id: user_id,
                        role: "Admin",
                        status: 1
                    }
                });

                await prisma.channels.create({
                    data:{
                        channel_name:"Channel",
                        server_id:userServer.id,
                    }
                });
            }

            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Couldn't create a server" };
        }
    });


     // Met à jour un serveur
    server.put<{Params: { id: number}, Body: { name: string, }}>('/servers/:id', async (request, reply) => {
        const id = request.params.id;
        const name = request.body.name;
        console.log(name);
        try{
            const update = await prisma.servers.update({
                where:{
                    id
                },
                data:{
                    name
                }
            });
            return {success: true, message: "Server's updated"};
        } catch (err){
            console.log(err);
            return {success: false, message: "Couldn't update the server"}
        }
    });


    // Supprime un serveur
    server.delete<{Params:{id:number}}>('/servers/:id', async (request, reply) => {
        const { id } = request.params;
        try{
            const result = await prisma.servers.delete({
                where:{id}
            });
            return {success:true, message:"Server deleted"};
        }catch(err){
            console.log(err);
            return {success:false, message:"Server couldn't be deleted"};
        }
    });


    server.delete<{Params:{id:number}}>('/servers/:id/leave', async (request, reply) => {
        const server_id = request.params.id;
        const token = request.cookies.token;
            
        if(!token){
            return {success: false, message: "You're not logged"};
        }

        const user = server.jwt.verify(token) as JwtPayload
        const user_id = user.id;

        try{

            // ADMIN ?
            const isAdmin = await prisma.servers.findFirst({
                where:{
                    id: server_id,
                    owner_id: user_id,
                }
            })

            if(isAdmin){
                const result = await prisma.servers.delete({
                    where:{
                        id:server_id
                    }
                })
            } else{
                const result = await prisma.servermembers.deleteMany({
                    where:{
                        server_id,
                        user_id
                    }
                });
            }

            return {succes:true, message:"You left the server"};
        } catch(err){
            return {success:false, essage:"Couldn't leave the server"};
        }
    });

    server.get<{Params:{id:number}}>('/servers/:id/members', async (request, reply) => {
        const server_id = request.params.id;

        const users = await prisma.servermembers.findMany({
            select:{
                id:true,
                users:{
                    select:{
                        username:true,
                    }
                }
            },
            where:{
                server_id,
            }
        });
        return users;
    });

    server.put<{Params:{server_id:number}, Body:{user_id:number, new_role:string}}>('/servers/:id/members', async (request, reply) => {
        const {server_id } = request.params;
        const {user_id, new_role} = request.body;
        
        console.log("new role: " + new_role);

        try{

            const existing = await prisma.servermembers.findFirst({
                where:{
                    server_id,
                    user_id
                },
                select:{
                    id:true,
                    role:true,
                }
            })

            if(!existing){
                return {success:false, message:"The user couldn't be found"};
            }

            if(existing.role == new_role){
                return {success:false, message:"The user has already this role"};
            }

            const updateRole = await prisma.servermembers.update({
                where: {
                    id: existing.id
                },
                data: {
                    role: new_role as "User" | "Mod" | "Admin"
                }
            });
            return {success:true, message:"User's role updated"};
        }catch(err){
            console.log(err);
            return {success:false, message:"Couldn't change user's role"};
        }
    });

    server.get('/server/me', async (request, reply) => {
        const token = request.cookies.token;    

        if (!token) {
            return null
        }
        const user = server.jwt.verify(token) as JwtPayload
        const user_id = user.id;

        try{
            const serverData = await prisma.servers.findFirst({
                select:{
                    id:true,
                    name:true,
                },
                where:{
                    owner_id:user_id,
                }
            });
            return serverData;
        }catch(err){
            console.log(err)
        }
    });
}
