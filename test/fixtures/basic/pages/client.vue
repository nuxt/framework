<script setup lang="ts">
// explicit import to bypass client import protection
import BreaksServer from '../components/BreaksServer.client'
// ensure treeshake-client-only module remove theses imports without breaking
import TestGlobal from '../components/global/TestGlobal.vue'
import { FunctionalComponent } from '#components'

onMounted(() => import('~/components/BreaksServer.client'))
onBeforeMount(() => import('~/components/BreaksServer.client'))
onBeforeUpdate(() => import('~/components/BreaksServer.client'))
onRenderTracked(() => import('~/components/BreaksServer.client'))
onRenderTriggered(() => import('~/components/BreaksServer.client'))
onActivated(() => import('~/components/BreaksServer.client'))
onDeactivated(() => import('~/components/BreaksServer.client'))
onBeforeUnmount(() => import('~/components/BreaksServer.client'))
</script>

<template>
  <div>
    This page should not crash when rendered.
    <ClientOnly class="something">
      <span>rendered client-side</span>
      <BreaksServer />
      <BreaksServer>Some slot content</BreaksServer>
    </ClientOnly>
    This should render.
    <div>
      <ClientOnly class="another">
        <span>rendered client-side</span>
        <BreaksServer />
        <template #fallback>
          <div>fallback for ClientOnly</div>
        </template>
        <template #test>
          <div>This should not be rendered</div>
        </template>
      </ClientOnly>
    </div>
    <div>
      <ClientOnly>
        <div class="red">
          i'm red
        </div>
        <div>
          <FunctionalComponent />
          <TestGlobal />
        </div>
      </ClientOnly>
      <ClientOnlyScript>
        <template #test>
          <BreaksServer />
          <div id="client-side">
            This should be rendered client-side
          </div>
        </template>
      </ClientOnlyScript>
      <div class="blue">
        i'm blue
      </div>
    </div>
  </div>
</template>

<style scoped>
.red {
  color: rgb(255, 0, 0);
}
.blue {
  color: rgb(0, 0, 255);
}
</style>
