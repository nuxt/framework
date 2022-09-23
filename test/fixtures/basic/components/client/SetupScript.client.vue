<script setup lang="ts">
const props = defineProps<{ foo: string }>();
const count = ref(0);
const add = () => count.value++;
</script>

<template>
  <div>
    <div>client only script setup component {{ props.foo }}</div>
    <button @click="add">{{ count }}</button>

    <slot name="test" />
  </div>
</template>
