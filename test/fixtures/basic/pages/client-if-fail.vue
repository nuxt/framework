<template>
  <div>
    Hello World
    <div id="locator-for-playwright">
      <ClientIfFail uid="singleChild">
        <BreakInSetup />
      </ClientIfFail>
      <ClientIfFail uid="multiChild">
        <BreakInSetup />
        <BreakInSetup />
      </ClientIfFail>
      <ClientIfFail uid="partially-successfull">
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
