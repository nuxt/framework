<template>
  <div>
    stateful test {{ state }}
    <NuxtClientFallback>
      <BreakInSetup class="clientfallback-stateful" />
    </NuxtClientFallback>
  </div>
</template>

<script>
export default defineNuxtComponent({
  name: 'NuxtClientFallbackStateful',
  setup () {
    const state = ref(0)
    return {
      state
    }
  }
})
</script>
