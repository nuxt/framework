<template>
  <div>
    Hello World
    <FakeComponentToThrowError />
  </div>
</template>

<script>
import { defineNuxtComponent } from '@nuxt/app'

export default defineNuxtComponent({
})
</script>
