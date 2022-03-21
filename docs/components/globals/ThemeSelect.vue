<template>
  <UToggle
    v-model="isDark"
    icon-on="heroicons-outline:moon"
    icon-off="heroicons-outline:sun"
  />
</template>

<script setup>
const colorMode = useColorMode()

const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set () {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})
</script>
