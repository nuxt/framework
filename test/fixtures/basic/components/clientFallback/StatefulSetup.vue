
<template>
  <div>
    stateful setup {{ state }}
    <ClientFallback>
      <BreakInSetup class="clientfallback-stateful-setup" />
    </ClientFallback>
  </div>
</template>

<script setup>
const state = ref(1)
</script>
