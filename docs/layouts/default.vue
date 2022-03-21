<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />

    <div class="min-h-[calc(100vh-4rem)] flex flex-col">
      <DocsPage>
        <template #header>
          <DocsNavbar />
        </template>

        <template #left>
          <DocsAside active-class="u-text-gray-900 u-bg-gray-200" />
        </template>

        <template #right>
          <DocsToc />
        </template>

        <NuxtPage />
      </DocsPage>
    </div>

    <Footer />
  </div>
</template>
