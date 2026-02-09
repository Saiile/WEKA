import type { FastifyInstance } from 'fastify'
import { prisma } from '../prismaClient.js'

interface JwtPayload {
     id: number
     username: string
     email?: string
 }

interface ServerRequest{
    server_id: number
}


export async function servermembersRoute(server: FastifyInstance) {

    server.post<{ Body: ServerRequest }>('/servers/:serverId/join', async (request, reply) => {
        const serverId = request.body.server_id;
        const token = request.cookies.token;
            
        if(!token){
            return {success: false, message: "You're not logged"};
        }

        const user = server.jwt.verify(token) as JwtPayload
        const user_id = user.id;
        
        try {    
            // Check if the row already exists
            const existing = await prisma.servermembers.findFirst({
                where: {
                    user_id: user.id,
                    server_id: serverId
                }
            });

            if (existing) {
                return { success: false, message: 'Request already sent' };
            }

            // If not exists, create
            await prisma.servermembers.create({
                data: { user_id, server_id: serverId }
            });

            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Couldn't send a request" };
        }
    });

    
    
    /*
      serversMember status:
      - 0 : waiting
      - 1 : accepted
      - 2 : banned

      to kick just delete the row
    */

    // Accepte un utlilisateur ou ban un utilisateur
    server.put<{Params: { user_id: number, server_id: number}, Body: {status:number}}>('/servers/:server_id/members/:user_id', async (request, reply) => {
        const {user_id, server_id} = request.params;
        const newStatus = request.body.status;

        try{

            const serverMember = await prisma.servermembers.findFirst({
                where:{
                    user_id,
                    server_id
                },
                select:{
                    id:true,
                    status:true,
                }
            })

            console.log(serverMember);

            if(serverMember){
                if(serverMember.status == newStatus){
                    if(newStatus == 1){
                        return {success: false, message: "User already accepted in the server"};
                    } else if(newStatus == 2){
                        return {success: false, message: "User already banned from the server"};
                    }                 
                }
            
                const update = await prisma.servermembers.update({
                    where:{
                        id:serverMember.id,
                    },
                    data:{
                        status: newStatus
                    }
                });

                if(newStatus == 1){
                    return {success: true, message: "User accepted in the server"};
                } else if(newStatus == 2){
                    return {success: true, message: "User banned from the server"};
                }
            } else{
                return {success: false, message: "User's not found in the server"};
            }
        } catch (err){
            console.log(err);
            return {success: false, message: "Couldn't update user's status"}
        }
    });

    // Kick un utilisateur
    server.delete<{Params:{user_id:number, server_id:number}}>('/servers/:server_id/members/:user_id', async (request, reply) => {
        const { user_id, server_id } = request.params;
        try{

            const exist = await prisma.servermembers.findFirst({
                where:{
                    user_id,
                    server_id
                },
                select:{
                    id:true,
                }
            });

            if(exist){
                const result = await prisma.servermembers.delete({
                    where:{
                        id:exist.id,
                    }
                });
                return {success:true, message:"User kicked from the server"};
            } else{
                return {success:true, message:"User not found in the server"};
            }

        } catch(err){
                console.log(err);
                return {success:false, message:"Couldn't kick the user"};
        }
    });

    // Récupère les utilisateurs d'un serveur qui sont soit en ettente, bannit ou accépté.
    server.get<{Params:{server_id:number, status:number}}>('/servers/:server_id/members/status/:status', async (request, reply) => {
        const {server_id, status} = request.params;

        const statusValue = Number(status);

        try{
            const serverMembers = await prisma.servermembers.findMany({
                select:{
                    id:true,
                    user_id:true,
                    users:{
                        select:{
                            username:true,
                        }
                    },
                    status:true,
                    role: true,
                },
                where:{
                    server_id,
                    status: statusValue,
                }
            });

            return serverMembers.map(m => ({
                id: m.id,
                user_id: m.user_id,
                username: m.users.username,
                status: m.status,
                role: m.role
            }));

        }catch(err){
            console.log(err);
        }

    });
    
    server.get<{Params:{server_id:number}}>('/servers/:server_id/me/role', async (request, reply) => {
        const {server_id} = request.params;
        const token = request.cookies.token;  
        if(!token){
            return {success: false, message: "You're not logged"};
        }

        const user = server.jwt.verify(token) as JwtPayload
        const user_id = user.id;

        try{
            const role = await prisma.servermembers.findFirst({
                select:{
                    role:true
                },
                where:{
                    server_id,
                    user_id,
                }
            });
            console.log(role);
            return role

        }catch(err){
            console.log(err);
        }

    });


}
