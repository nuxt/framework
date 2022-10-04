<script setup lang="ts">
onMounted(() => import('~~/components/BreaksServer.client.ts'))
onBeforeMount(() => import('~~/components/BreaksServer.client.ts'))
onBeforeUpdate(() => import('~~/components/BreaksServer.client.ts'))
onRenderTracked(() => import('~~/components/BreaksServer.client.ts'))
onRenderTriggered(() => import('~~/components/BreaksServer.client.ts'))
onActivated(() => import('~~/components/BreaksServer.client.ts'))
onDeactivated(() => import('~~/components/BreaksServer.client.ts'))
onBeforeUnmount(() => import('~~/components/BreaksServer.client.ts'))
</script>

<template>
  <div>
    This page should not crash when rendered.
    <ClientOnly class="something">
      test
      <BreaksServer />
      <BreaksServer>Some slot content</BreaksServer>
    </ClientOnly>
    This should render.
    <div>
      <ClientOnly class="another">
        test
        <BreaksServer />
      </ClientOnly>
    </div>
  </div>
</template>
