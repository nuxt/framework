<template>
  <pre class="p-2 text-xs rounded bg-gray-50">{{ user }}</pre>
</template>

<script setup>
const user = useSupabase().user
</script>
