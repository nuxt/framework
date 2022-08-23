<script lang="tsx" setup>
const welcome = () => {
  return <span>Welcome </span>
}
const nuxt3 = () => {
  return <span>nuxt3</span>
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const content = () => {
  return (
    <div>
      {welcome()}
      <span>to </span>
      {nuxt3()}
    </div>
  )
}
</script>
<template>
  <div>
    <content-dom />
    <content />
  </div>
</template>
