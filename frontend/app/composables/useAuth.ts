
export function useAuth() {

  const { addNotif } = useNotif();
  const { loginRequest, registerRequest  } = apiAuth();
  
  function isMailValid(email: string) {
    return email.includes("@");
  }

  function login(username: string, password: string): void {
    if( !username || !password){
      if (!username) addNotif(false,"Username required");
      if (!password) addNotif(false,"Password required");
      return;
    } else{
      loginRequest(username, password);
    }
  }



/*
  function register(email: string, username: string, password: string): void {
    if (!email) addNotif(false,"Email required");
    if (!isMailValid(email)) addNotif(false,"Invalid email");
    if (!username) addNotif(false,"Username required");
    if (!password) addNotif(false,"Password required");
    if (!/[A-Z]/.test(password)) addNotif(false,"1 uppercase required");
    if (!/[^a-zA-Z0-9]/.test(password)) addNotif(false,"1 special character required");
    if (password.length < 8) addNotif(false,"should be at least 8 characters");
  }

  return { login, register };
}
*/  


  function register(email: string, username: string, password: string): void {
    if(!email || !username || !password){
      if (!email) addNotif(false,"Email required");
      if (!isMailValid(email)) addNotif(false,"Invalid email");
      if (!username) addNotif(false,"Username required");
      if (!password) addNotif(false,"Password required");
      if (!/[A-Z]/.test(password)) addNotif(false,"1 uppercase required");
      if (!/[^a-zA-Z0-9]/.test(password)) addNotif(false,"1 special character required");
      if (password.length < 8) addNotif(false,"should be at least 8 characters");
    return;
  } else{
    registerRequest(email, username, password)
  }
  }
  return { login, register };

}
