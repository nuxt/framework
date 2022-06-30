<script setup>
const foo = ref(0)
const sharedState = useState('other')
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
      <ServerOnlyComponent :foo="foo" />
      <div class="my-2 gap-2 flex flex-row justify-center items-center">
        <NButton @click="foo++">
          Increase prop
        </NButton>
        <NButton @click="sharedState++">
          Increase external state (won't immediately trigger rerender)
        </NButton>
      </div>
      <NuxtWithPrefix class="mt-6" />
    </div>
  </NuxtExampleLayout>
</template>
