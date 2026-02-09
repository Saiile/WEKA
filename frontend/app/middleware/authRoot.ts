const { addNotif } = useNotif();

export default defineNuxtRouteMiddleware(async (to, from) => {
  
  try {
    const token = useCookie('token')?.value;
    const result: boolean = await $fetch('http://localhost:8080/auth', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include'
    });
    
    if(result){
      return navigateTo('/dashboard');
    }
    
  } catch (error) {
    //addNotif(false, 'Error');
  }

});
