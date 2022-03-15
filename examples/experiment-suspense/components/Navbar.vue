<script setup>
const links = [
  ['Home', '/'],
  ['Everest', '/mount-everest'],
  ['Aconcagua', '/aconcagua']
]
const route = useRoute()
</script>

<template>
  <ul>
    <li v-for="[text, url] of links" :key="url">
      <NuxtLink :to="url" :class="{ active: url === route.path }">
        {{ text }}
      </NuxtLink>
    </li>
  </ul>
</template>

<style scoped>
ul {
  list-style: none;
  margin: 0;
  padding: 0;
  clear: both;
  overflow: hidden;
}
li {
  float: left;
  padding: 5px 10px;
}
a {
  color: black;
  text-decoration: none;
  border-bottom: 1px black solid;
}
a.active {
  font-weight: bold;
  border-bottom-width: 2px;
}
</style>
