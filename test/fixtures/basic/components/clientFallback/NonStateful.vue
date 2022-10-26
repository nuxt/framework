<template>
  <div>
    non stateful
    <ClientFallback>
      <BreakInSetup class="clientfallback-non-stateful" />
    </ClientFallback>
  </div>
</template>

<script>
export default defineNuxtComponent({
  name: 'ClientFallbackStateful'
})
</script>
