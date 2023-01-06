<script setup>
const foo = ref(0)
</script>

<template>
  <NuxtExampleLayout example="auto-imports/components">
    <h1 class="text-xl opacity-50">
      Auto Imported Components
    </h1>
    <div>
      <!-- Auto Imported Components -->
      <HelloWorld class="text-2xl" />
      <Nuxt3 class="text-2xl" />
      <ParentFolderHello class="mt-6" />
      <ClientAndServer style="color: red">
        <div>[Slot]</div>
      </ClientAndServer>
      <JustClient />
      <NCard class="flex flex-col gap-2 items-center pb-4">
        <ServerOnlyComponent :foo="foo" />
        <NButton @click="foo++">
          Increase prop
        </NButton>
      </NCard>
      <NuxtWithPrefix class="mt-6" />
    </div>
  </NuxtExampleLayout>
</template>
