<script>
export default {
  data () {
    return {
      open: false
    }
  }
}
</script>

<template>
  <button @click="open = true">
    Open Modal
  </button>
  <Teleport to="body">
    <div v-if="open" class="modal">
      <p>Hello from the modal!</p>
      <button @click="open = false">
        Close
      </button>
    </div>
  </Teleport>
  <ClientOnly>
    <Teleport to="body">
      <div>
        Hello from a client-side teleport!
      </div>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.modal {
  position: fixed;
  z-index: 999;
  top: 20%;
  left: 50%;
  width: 300px;
  margin-left: -150px;
}
</style>
