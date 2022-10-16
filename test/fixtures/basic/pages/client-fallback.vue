<template>
  <div>
    Hello World
    <div id="locator-for-playwright">
      <ClientFallback>
        <BreakInSetup />
      </ClientFallback>
      <ClientFallback>
        <BreakInSetup class="broke-in-ssr" />
        <BreakInSetup />
      </ClientFallback>
      <ClientFallback>
        <BreakInSetup />
        <SugarCounter id="sugar-counter" :count="count" />
      </ClientFallback>
    </div>
    <button id="increment-count" @click="count++">
      increment count
    </button>
  </div>
</template>

<script setup>
const count = ref(0)
</script>
