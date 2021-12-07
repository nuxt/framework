<script setup lang="ts">
const user = useCookie<{ name: string }>('user')
const logins = useCookie<number>('logins')

const name = ref('')

const login = () => {
  logins.value = (logins.value || 0) + 1
  user.value = { name: name.value }
}

const logout = () => {
  user.value = null
}
</script>

<template>
  <div class="relative font-sans">
    <div class="container mx-auto py-8">
      <div class="flex items-bottom">
        <img src="https://raw.githubusercontent.com/nuxt/framework/main/playground/assets/logo.svg" h="12">
        <div class="mt-auto text-2xl mx-3 m-0.5 flex">
          <div class="op-50">
            examples/
          </div><a href="https://v3.nuxtjs.org/docs/usage/cookies" class="hover:text-green5 hover:underline">useCookie</a>
        </div>
      </div>
      <NCard class="mt-2 p-5 flex flex-col gap-2">
        <template v-if="user">
          <h1 class="text-3xl">
            Welcome, {{ user.name }}! 👋
          </h1>
          <div>
            <NTip n="green6" icon="carbon:idea" class="inline-flex">
              You have logged in <b>{{ logins }} times</b>!
            </NTip>
          </div>
          <div class="mt-3">
            <NButton n="red" icon="carbon:logout" @click="logout">
              Log out
            </NButton>
          </div>
        </template>
        <template v-else>
          <h1 class="text-3xl">
            Login
          </h1>
          <NTextInput v-model="name" placeholder="Enter your name..." @keypress.enter="login()" />
          <div class="mt-3">
            <NButton n="green6" icon="carbon:user" :disabled="!name" @click="login">
              Log in
            </NButton>
          </div>
        </template>
      </NCard>
    </div>
  </div>
</template>
