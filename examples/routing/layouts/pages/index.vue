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
        <NButton @click="setLayout('default')">
          Change to default layout
        </NButton>
        <NButton @click="setLayout('custom')">
          Change to custom layout
        </NButton>
        <NButton @click="setLayout('other')">
          Change to other layout
        </NButton>
      </nav>
    </template>
  </NuxtExampleLayout>
</template>
