<template>
  <div>
    stateful test {{ state }}
    <ClientFallback>
      <BreakInSetup class="clientfallback-stateful" />
    </ClientFallback>
  </div>
</template>

<script>
export default defineNuxtComponent({
  name: 'ClientFallbackStateful',
  setup () {
    const state = ref(0)
    return {
      state
    }
  }
})
</script>
