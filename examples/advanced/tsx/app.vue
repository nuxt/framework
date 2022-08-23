<script lang="tsx" setup>
import { defineComponent } from 'vue'

// Component could be a simple function with JSX syntax
const Welcome = () => <span>Welcome </span>

// Or using defineComponent setup that returns render function with JSX syntax
const Nuxt3 = defineComponent(() => {
  return () => <span>nuxt3</span>
})

// We can combine components with TSX syntax too
const InlineComponent = () => (
    <div>
      <Welcome />
      <span>to </span>
      <Nuxt3 />
    </div>
)
</script>

<template>
  <NuxtExampleLayout example="advanced/tsx">
    <InlineComponent />
    <!-- Defined in components/tsx-component.ts -->
    <TsxComponent message="This is an external TSX component" />
  </NuxtExampleLayout>
</template>
