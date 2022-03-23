<script setup>
const foo = useExtendsFoo()
</script>

<template>
  <div>
    <div>Hello from extended page of foo!</div>
    <div>Composable | useExtendsFoo: {{ foo }}</div>
    <div>Plugin | foo: {{ $foo() }}</div>
    <ExtendsFoo />
  </div>
</template>
