<template>
  <div
    class="z-[1] sticky top-0"
    :class="{ 'border-t u-border-gray-200': y <= 80, 'backdrop-blur-md shadow shadow-gray-200 dark:shadow-gray-900 border-transparent': y > 80 }"
  >
    <div class="absolute top-0 w-full h-16 bg-white bg-opacity-75 dark:bg-black" />
    <UContainer padded>
      <slot />
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

const { y } = useWindowScroll()
</script>
