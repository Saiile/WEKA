export function apiAuth(){
    const { addNotif } = useNotif();
    const config = useRuntimeConfig();
    const API_URL = config.public.apiUrl;

    type MeResponse = {
        id: number;
        username: string;
        email: string;
    };

    type UpdateMePayload = {
  email?: string
  username?: string
  password?: string
}
    const currentUser = useState('currentUser', () => ({
        id: null as number | null,
        username: null as string | null,
        email: null as string | null,
    }));

    async function fetchCurrentUser() {
       try{
           const me = await $fetch<MeResponse>(`${API_URL}/me`, {
           credentials: 'include',
           });
   
           currentUser.value = {
           id: me.id,
           username: me.username,
           email: me.email,
           };
       } catch(error){
        console.log('error', error)
        currentUser.value = {
            id: null,
            username: null,
            email: null
        }
       }
    }

    async function loginRequest (username: string, password: string): Promise<void>{
        try{
        const result: Result = await $fetch(`${API_URL}/login`, {
                method: 'POST',
                body:{
                    username: username,
                    password: password,
                },
                credentials: 'include',
        });

        if(result.success){
        await fetchCurrentUser()
        addNotif(true, result.message )
        navigateTo('/dashboard');
        } 
    } catch (err: any) {
        const data = err?.data 
            addNotif(false, data.message )           
        }
    }

    async function logout() {
        await $fetch(`${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        currentUser.value = {
            id: null,
            username: null,
            email:null,
        }
        
        addNotif(true,"Logged out");
        return navigateTo('/');
    }

    async function registerRequest(email: string, username: string, password: string): Promise<void> {
    try {
        const result: any = await $fetch(`${API_URL}/register`, {
        method: 'POST',
        body: { email, username, password },
        })

        addNotif(true, result.message )
    } catch (err: any) {
        const data = err?.data 
    
            addNotif(false, data.message )

    }
    }

    async function deleteMe(): Promise<void> {
    try {
        const result: any = await $fetch(`${API_URL}/me`, {
        method: 'DELETE',
        credentials: 'include',
        })

        // reset state
        currentUser.value = { id: null, username: null, email: null }

        addNotif(true, result.message ?? 'Account deleted')
        navigateTo('/')
    } catch (err: any) {
        const data = err?.data
        addNotif(false, data?.message ?? 'Delete failed')
    }
    }

async function updateMe(payload: UpdateMePayload): Promise<void> {
  try {
    const result: any = await $fetch(`${API_URL}/me`, {
      method: 'PUT',
      body: payload,
      credentials: 'include',
    })

    currentUser.value = {
      id: result.user.id,
      username: result.user.username,
      email: result.user.email,
    }

    addNotif(true, result.message ?? 'Profile updated')
  } catch (err: any) {
    const data = err?.data
    addNotif(false, data?.message ?? 'Update failed')
  }
}

    return{
        loginRequest,
        logout,
        fetchCurrentUser,
        currentUser,
        registerRequest,
        deleteMe,
        updateMe
    }

}