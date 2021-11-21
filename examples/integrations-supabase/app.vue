<template>
  <UContainer class="py-12">
    <h1 class="mb-4 text-4xl text-center">
      Nuxt + Supabase
    </h1>
    <UCard class="max-w-xl mx-auto">
      <div v-if="user">
        <p>Welcome <strong>{{ user.email }}</strong></p>
        <User />
        <UButton @click="logout">
          Logout
        </UButton>
      </div>
      <div v-else-if="emailStatus.error">
        <p class="text-red-400">
          {{ emailStatus.error }}. <UButton @click="emailStatus.error = null">
            Retry
          </UButton>
        </p>
      </div>
      <div v-else-if="emailStatus.sent">
        <p>Check your email inbox on <strong>{{ email }}</strong> to login into your account.</p>
      </div>
      <form v-else @submit.prevent="login">
        <div class="flex items-end gap-2">
          <UInputGroup name="email" required label="Email">
            <UInput v-model="email" type="text" required name="email" placeholder="Email" />
          </UInputGroup>
          <UButton v-if="emailStatus.sending" type="button" disabled>
            Signin-in...
          </UButton>
          <UButton v-else type="submit">
            Sign-in
          </UButton>
        </div>
        <p class="mt-2 text-gray-700">
          A magic link will be sent to your email inbox.
        </p>
      </form>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
const { user, auth } = useSupabase()
const email = ref('')
const emailStatus = reactive({
  sending: false,
  sent: false,
  error: null
})

const login = async () => {
  if (emailStatus.sending) { return }
  emailStatus.sending = true
  emailStatus.error = false
  const { error } = await auth.signIn({ email: email.value })
  if (error) {
    emailStatus.error = error.message
  } else {
    emailStatus.sent = true
  }
  emailStatus.sending = false
}
const logout = () => auth.signOut()
</script>
