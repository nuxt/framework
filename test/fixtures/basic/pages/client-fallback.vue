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
        <SugarCounter id="sugar-counter" :multiplier="multiplier" />
      </ClientFallback>
      <!-- nested children fails -->
      <ClientFallback>
        <div>
          <BreakInSetup />
        </div>
        <SugarCounter :multiplier="multiplier" />
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
      <ClientFallbackStateful />
      <ClientFallbackStatefulSetup />
      <ClientFallbackNonStatefulSetup />
      <ClientFallbackNonStateful />
    </div>
    <button id="increment-count" @click="multiplier++">
      increment count
    </button>
  </div>
</template>

<script setup>
const multiplier = ref(0)
</script>
