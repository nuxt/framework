<template>
  <NuxtExampleLayout example="routing/layouts">
    <template #nav>
      <nav class="flex align-center gap-4 p-4">
        <NuxtLink to="/default">
          Default layout
        </NuxtLink>
        <NuxtLink to="/custom">
          Custom layout
        </NuxtLink>
        <NuxtLink to="/dynamic">
          Dynamic layout
        </NuxtLink>
        <NuxtLink to="/other">
          Other layout
        </NuxtLink>
        <NButton @click="layoutValue = 'default'">
          Change to default layout 
        </NButton>
        <NButton @click="layoutValue = 'custom'">
          Change to custom layout 
        </NButton>
        <NButton @click="layoutValue = 'other'">
          Change to other layout 
        </NButton>
      </nav>
    </template>
  </NuxtExampleLayout>
</template>
<script setup>
const layoutValue = setLayout()
</script>
