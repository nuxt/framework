<template>
  <div>
    Hello World
    <div id="locator-for-playwright">
      <ClientIfFail uid="singleChild">
        <BreakinSetup />
      </ClientIfFail>
      <CLientIfFail uid="multiChild">
        <BreakinSetup />
        <BreakinSetup />
      </CLientIfFail>
      <CLientIfFail uid="partially-successfull">
        <BreakinSetup />
        <SugarCounter :count="count" />
      </CLientIfFail>
    </div>
  </div>
</template>

<script setup>
const count = ref(0)
</script>
