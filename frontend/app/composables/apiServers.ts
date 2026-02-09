export function apiServers(){
    const { addNotif } = useNotif();
    const config = useRuntimeConfig();
    const API_URL = config.public.apiUrl;

    async function getAllServers(): Promise<Server[]>{
        const servers: Server[] = await $fetch<Server[]>(`${API_URL}/getAllServers`);
        return servers;
    }

    async function getJoinedServers(): Promise<Server[]>{
        const servers: Server[] = await $fetch<Server[]>(`${API_URL}/servers`, {
            credentials: 'include',
        });
        return servers; 
    }

    async function getServerDetails(id:number): Promise<serverDetails>{
        const result: serverDetails = await $fetch(`${API_URL}/server/${id}`, {
            credentials: 'include',
        });
        return result;
    }

    async function getOwnerId(id:number): Promise<number>{
        const result: {owner_id: number} = await $fetch(`${API_URL}/server/${id}/owner`, {
            credentials: 'include',
        });
        return result.owner_id;
    }

    async function apiJoinServer(server: Server): Promise<void>{
        const result: Result = await $fetch(`${API_URL}/servers/:serverId/join`, {
                method: 'POST',
                body: {
                    server_id: server.id,
            },
            credentials: 'include',
        });

        if(result.success){
            addNotif(result.success, 'Request to join ' + server.name + ' sent');
        } else{
            addNotif(result.success, result.message);            
        }
    }

    async function apiCreateServer(name: string): Promise<void>{
        const result: Result = await $fetch(`${API_URL}/servers`, {
                method: 'POST',
                body: {
                    name: name,
            },
            credentials: 'include',
        });

        if(result.success){
            addNotif(result.success, 'You successfully created your server ' + name);
        } else{
            addNotif(result.success, result.message);            
        }        
    }

    async function updateServer(id:number, name:string): Promise<void>{
        const result: Result = await $fetch(`${API_URL}/servers/${id}`, {
                method: 'PUT',
                body: {name},
            credentials: 'include',
        });

        addNotif(result.success, result.message); 
    };

    async function deleteServer(id: number): Promise<void>{
        const result: Result = await $fetch(`${API_URL}/servers/${id}`,{
            method: 'DELETE',
            credentials: 'include',
        });

        addNotif(result.success, result.message);
    };

    async function leaveServer(id:number): Promise<void>{
        const result: Result = await $fetch(`${API_URL}/servers/${id}/leave`,{
            method: 'DELETE',
            credentials: 'include',
        });
        addNotif(result.success, result.message);    
    };

    async function apiMyServer(): Promise<{id:number, name:string}>{
        try{
            const serverData: {id:number, name:string} = await $fetch(`${API_URL}/server/me`,{
                method: 'GET',
                credentials: 'include',
            });
            return serverData
        }catch(err){
            addNotif(false, "Couldn't fetch");
            return {id:0,name:'null'};
        }
    }

    async function apiGetUsers(server_id: number, status: number): Promise<User[]>{
        
        try{
            const serverData: User[] = await $fetch(`${API_URL}/servers/${server_id}/members/status/${status}`,{
                method: 'GET',
                credentials: 'include',
            });
            return serverData      
        }catch(err){
            addNotif(false, "Couldn't fetch");
            return [];
        }
    }

    async function apiAcceptUser(server_id: number, user_id: number): Promise<void>{
        
        try{
            const result: Result = await $fetch(`${API_URL}/servers/${server_id}/members/${user_id}`,{
                method: 'PUT',
                body:{
                    status:1
                },
                credentials: 'include',
            });
            console.log(result);
            addNotif(result.success, result.message);
        }catch(err){
            addNotif(false, "Couldn't fetch");
        }
    }

    async function apiBanUser(server_id: number, user_id: number): Promise<void>{
        
        try{
            const result: Result = await $fetch(`${API_URL}/servers/${server_id}/members/${user_id}`,{
                method: 'PUT',
                body:{
                    status:2
                },
                credentials: 'include',
            });
            addNotif(result.success, result.message);
        }catch(err){
            addNotif(false, "Couldn't fetch");
        }
    }

    async function apiKickUser(server_id: number, user_id: number): Promise<void>{
        
        try{
            const result: Result = await $fetch(`${API_URL}/servers/${server_id}/members/${user_id}`,{
                method: 'DELETE',
                credentials: 'include',
            });
            addNotif(result.success, result.message);
        }catch(err){
            addNotif(false, "Couldn't fetch");
        }
    }

    async function apiUserRole(server_id: number): Promise<string>{
        try{
            const role: {role:string} = await $fetch(`${API_URL}/servers/${server_id}/me/role`,{
                method: 'GET',
                credentials: 'include',
            });
            console.log(role.role);
            return role.role;
        }catch(err){
            addNotif(false, "Couldn't fetch");
            return "";
        }
    }

    async function apiUserUpdateRole(server_id: number, user_id: number, role: string): Promise<void>{
        try{
            const result: Result = await $fetch(`${API_URL}/servers/${server_id}/members`,{
                method: 'PUT',
                body:{
                    user_id: user_id,
                    new_role: role,
                },
                credentials: 'include',
            });
            addNotif(result.success, result.message);
        }catch(err){
            console.log(err);
            addNotif(false, "Couldn't fetch");
        }
    }

    async function apiUser(): Promise<{id: number, username: string, email: string}>{
        try{
            const me: {id: number, username: string, email: string} = await $fetch(`${API_URL}/me`,{
                method: 'GET',
                credentials: 'include',
            });
            return me;
        }catch(err){
            addNotif(false, "Couldn't fetch");
            return {id:0, username:"", email:""};
        }
    }

    async function apiGetChannels(server_id: number): Promise<any>{
        // recup les channels du serveur
        const res = await fetch(`${API_URL}/servers/${server_id}/channels`, {
        credentials: "include",
        });
        if (!res.ok) {
        throw new Error(`Failed to fetch channels for server ${server_id}`);
        }
        const data = await res.json() as { channels: { id: number; channel_name: string }[] };
        return data.channels;
    }

    return{
        getAllServers,
        getJoinedServers,
        apiJoinServer,
        apiCreateServer,
        getServerDetails,
        updateServer,
        deleteServer,
        leaveServer,
        apiMyServer,
        apiGetUsers,
        apiAcceptUser,
        apiBanUser,
        apiKickUser,
        apiUserRole,
        apiUser,
        getOwnerId,
        apiGetChannels,
        apiUserUpdateRole
    }

}