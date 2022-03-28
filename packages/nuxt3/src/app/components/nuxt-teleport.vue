<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NuxtTeleport',
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
