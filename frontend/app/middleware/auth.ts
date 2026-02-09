const { addNotif } = useNotif();

export default defineNuxtRouteMiddleware(async (to, from) => {
  const token = useCookie('token')?.value;
  const result: boolean = await $fetch('http://localhost:8080/auth', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include'
  });
  
  if(!result){
    return navigateTo('/');
  }
});
