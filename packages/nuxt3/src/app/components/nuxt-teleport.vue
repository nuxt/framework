<script>
import { defineComponent } from 'vue'
import ClientOnly from './client-only.mjs'

export default defineComponent({
  name: 'NuxtTeleport',
  components: { ClientOnly },
  props: {
    //  string | RendererElement | null | undefined
    to: [String, Object],
    disabled: Boolean
  }
})
</script>

<template>
  <ClientOnly>
    <Teleport :to="to" :disabled="disabled">
      <slot />
    </Teleport>
  </ClientOnly>
</template>
