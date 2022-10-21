<template>
  <div>
    Hello World
    <div id="locator-for-playwright">
      <!-- single child -->
      <ClientFallback fallback-tag="span" class="break-in-ssr" fallback="this failed to render">
        <BreakInSetup />
      </ClientFallback>
      <!-- multi child -->
      <ClientFallback>
        <BreakInSetup class="broke-in-ssr" />
        <BreakInSetup />
      </ClientFallback>
      <!-- don't render if one child fails in ssr -->
      <ClientFallback>
        <BreakInSetup />
        <SugarCounter id="sugar-counter" :count="count" />
      </ClientFallback>
      <!-- nested children fails -->
      <ClientFallback>
        <div>
          <BreakInSetup />
        </div>
        <SugarCounter :count="count" />
      </ClientFallback>
      <!-- should be rendered -->
      <ClientFallback fallback-tag="p">
        <FunctionalComponent />
      </ClientFallback>
      <!-- fallback -->
      <ClientFallback>
        <BreakInSetup />
        <template #fallback>
          <div>Hello world !</div>
        </template>
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
