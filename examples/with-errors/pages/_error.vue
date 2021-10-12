<template>
  <h2>Error page</h2>
  <div v-for="(error, index) in errors" :key="error.message">
    <h2 v-if="error.name">
      {{ error.name }}
    </h2>
    <blockquote v-if="error.message">
      {{ error.message }}
    </blockquote>
  </div>
</template>

<script>
export default {
  props: {
    errors: Array
  }
}
</script>
