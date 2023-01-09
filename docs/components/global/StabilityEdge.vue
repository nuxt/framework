<script setup>
defineProps({
  title: { type: String, default: 'This feature' }
})
</script>

<template>
  <Alert icon="🧪">
    {{ title }} is available on edge channel. Check out the
    <Link to="/docs/guide/going-further/edge-channel/">
      Edge Channel Documentation
    </Link> to beta test.
    <slot />
  </Alert>
</template>
