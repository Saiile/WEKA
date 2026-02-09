<script setup lang="ts">
    const loginUsername = ref<string>("");
    const loginPassword = ref<string>("");
    const registerEmail = ref<string>("");
    const registerUsername = ref<string>("");
    const registerPassword = ref<string>("");

    const loginError = ref<string | null>(null);
    const registerError = ref<string | null>(null);

    const {login, register} = useAuth();
</script>

<template>
  <div class="authContainer pixel-corners">
    <p class="title">Join weka</p>

    <div class="formsContainer">
      <!-- LOGIN -->
      <form @submit.prevent="login(loginUsername, loginPassword);">
        <p>Login</p>

        <input type="text" placeholder="Username" v-model="loginUsername" />
        <input type="password" placeholder="Password" v-model="loginPassword" />

        <input type="submit" value="Login" />
      </form>

      <!-- REGISTER -->
      <form @submit.prevent="register(registerEmail, registerUsername, registerPassword);">
        <p>Register</p>

        <input type="email" placeholder="Email" v-model="registerEmail" />
        <input type="text" placeholder="Username" v-model="registerUsername" />
        <input type="password" placeholder="Password" v-model="registerPassword" />

        <input type="submit" value="Register" />
      </form>
    </div>
  </div>
</template>


<style scoped>

    .authContainer {
        width: 500px;
        border: 5px solid black;
        background-color: white;
    }

    p{
        width: 100%;
        text-align: center;
    }

    .formsContainer{
        padding: 20px;
        display: flex;
        justify-content: space-evenly;
        background-color: white;
    }

    form{
        display: flex;
        flex-direction: column;
    }


</style>