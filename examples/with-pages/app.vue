<template>
  <MyLayout>
    <template #nav>
      <nav class="flex align-center gap-4 p-4">
        <NuxtLink to="/" class="n-link-base">
          Home
        </NuxtLink>
        <NuxtLink to="/about" class="n-link-base">
          About
        </NuxtLink>
        <NuxtLink to="/parent" class="n-link-base">
          Parent (index)
        </NuxtLink>
        <NuxtLink to="/parent/b" class="n-link-base">
          Parent (b)
        </NuxtLink>
      </nav>
    </template>
    <NuxtPage />
  </MyLayout>
</template>
