<template>
  <div>
    Hello World
    <div id="locator-for-playwright">
      <ClientIfFail>
        <BreakInSetup />
      </ClientIfFail>
      <ClientIfFail>
        <BreakInSetup class="broke-in-ssr" />
        <BreakInSetup />
      </ClientIfFail>
      <ClientIfFail>
        <BreakInSetup />
        <SugarCounter id="sugar-counter" :count="count" />
      </ClientIfFail>
    </div>
    <button id="increment-count" @click="count++">
      increment count
    </button>
  </div>
</template>

<script setup>
const count = ref(0)
</script>
