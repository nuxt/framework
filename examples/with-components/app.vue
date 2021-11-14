<template>
  <div>
    <hello-world class="red" />
    <nuxt3 />
    <Foo class="red">
      <div>This is slot</div>
    </Foo>
  </div>
</template>

<style>
.red {
  color: red;
}
</style>
