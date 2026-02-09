<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DeleteComfirm from '~/components/DeleteConfirm.vue'

const { currentUser, fetchCurrentUser, updateMe, deleteMe } = apiAuth()

const formEmail = ref('')
const formUsername = ref('')
const formPassword = ref('')

const showDeleteConfirm = ref(false)
const deleting = ref(false)

onMounted(async () => {
  await fetchCurrentUser()
  if (currentUser.value.id) {
    formEmail.value = currentUser.value.email ?? ''
    formUsername.value = currentUser.value.username ?? ''
  }
})

async function submitUpdate() {
  await updateMe({
    email: formEmail.value,
    username: formUsername.value,
    password: formPassword.value || undefined,
  })
  formPassword.value = ''
}

async function confirmDelete() {
  if (deleting.value) return
  deleting.value = true
  try {
    await deleteMe()
  } finally {
    deleting.value = false
    showDeleteConfirm.value = false
  }
}
</script>

<template>
  <div v-if="currentUser.id">
    <form class="userForm" @submit.prevent="submitUpdate">
      <div>Email</div>
      <input type="email" v-model="formEmail" placeholder="Email" />

      <div>Username</div>
      <input type="text" v-model="formUsername" placeholder="Username" />

      <div>Password</div>
      <input type="password" v-model="formPassword" placeholder="New password (optional)" />
      <br />

      <input type="submit" value="Update profile" />

   
      <input
        type="button"
        value="Delete account"
        style="background-color: red; color:white; font-weight: bold;"
        @click="showDeleteConfirm = true"
      />
    </form>

    <DeleteComfirm
      :open="showDeleteConfirm"
      @cancel="showDeleteConfirm = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.userForm{
  display: flex;
  flex-direction: column;
}

.userForm input[type="submit"],
.userForm input[type="button"] {
  padding: 5px 10px;
  font-size: 12px;
  width: auto;
  max-width: 150px;
  margin: 5px auto;
  align-self: center;
}

.userForm input[type="button"] {
  width: auto;
  max-width: 120px;
}
</style>
