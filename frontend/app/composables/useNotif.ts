type Notif={
    id: number;
    type: string;
    message: string;
}

const notifs = ref<Notif[]>([]);

export function useNotif() {

  function maxId(): number{
    if(notifs.value.length == 0) return 0;
    
    let maxId = 0  
    for(const n of notifs.value){
      if(n.id > maxId){
        maxId = n.id;
      }
    }
    return maxId;
  }

    function addNotif(success: boolean, message: string){
        const id: number = maxId() + 1;
        let successStr;
        if(success){
          successStr = "success";
        } else{
          successStr = "error";
        }

        notifs.value.push({
            id,
            type: successStr, 
            message 
        });

          setTimeout(() => {
            removeNotif(id)
        }, 5000)
    }

    function removeNotif(id: number){
        const index = notifs.value.findIndex(notif => notif.id === id);
        if (index !== -1) {
        notifs.value.splice(index, 1);
        }
    }

    return{
        notifs,
        addNotif,
    }
}