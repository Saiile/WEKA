
const allServers = ref<Server[]>();
const joinedServers = ref<Server[]>();
const isServerCreated = ref<boolean>(false);

export function useServers(){
     const { getAllServers, getJoinedServers, apiJoinServer, apiCreateServer, apiMyServer, apiGetUsers } = apiServers();
     const { addNotif } = useNotif();

     async function refreshAllServers(): Promise<void>{
        allServers.value = await getAllServers();
        
        addNotif(true, "Server's list refreshed");
        
        if(allServers.value.length == 1){
            addNotif(true, allServers.value.length + " server found");
        } else{
            addNotif(true, allServers.value.length + " servers found");
        }
     }

     async function refreshJoinedServers(): Promise<void>{
          joinedServers.value = await getJoinedServers();
     }

     async function joinServer(server: Server): Promise<void>{
          await apiJoinServer(server);
     }

     async function createServer(name:string): Promise<void>{
          if(name.length < 3){
               addNotif(false, "Server's name too short");
               return;
          }
          await apiCreateServer(name);
          refreshJoinedServers();
          refreshAllServers();
          refreshIsServerCreated();
     };

     async function refreshIsServerCreated(): Promise<void>{
          if(await apiMyServer() != null){
               isServerCreated.value = true;
          } else{
               isServerCreated.value = false;
          }
     }

     async function myServer(): Promise<{id:number, name:string}>{
          return await apiMyServer();
     }

     /*
          0: pending
          1: joined
          2: banned
     */
    async function getUsers(server_id: number, status: number): Promise<User[]>{
          return apiGetUsers(server_id, status);    
    }

   return{
    allServers,
    joinedServers,
    refreshAllServers,
    refreshJoinedServers,
    joinServer,
    createServer,
    isServerCreated,
    refreshIsServerCreated,
    myServer,
    getUsers
   }
}