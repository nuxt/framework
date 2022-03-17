<template>
  <div>
    <Navbar />
    <h1 v-if="$route.path === '/'">
      Home
    </h1>
    <Mountain v-else/>
  </div>
</template>

<style>
body {
  background-color: aquamarine;
  font-family: sans-serif;
}
</style>
