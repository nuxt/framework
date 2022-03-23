<script setup>
definePageMeta({
  layout: 'override',
  middleware: 'override'
})
</script>

<template>
  <div>
    <div>Extended page from foo</div>
    <div>Middleware | override: {{ $route.meta.override }}</div>
    <ExtendsOverride />
  </div>
</template>
