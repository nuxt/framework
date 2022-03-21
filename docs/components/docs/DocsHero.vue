<template>
  <div class="flex flex-col items-center justify-center pb-48 gap-y-8 pt-36 md:pt-44 lg:pb-56 lg:pt-36 ">
    <div class="flex gap-x-2">
      <UBadge rounded label="Warning" />
      <span class="u-text-gray-500">
        Nuxt 3.0 is out.
        <a class="underline" href="https://github.com/nuxt">Read about it here</a>
      </span>
    </div>
    <h1 class="font-bold text-7xl u-text-gray-900">
      The Intuitive Vue Framework
    </h1>
    <p class="w-1/2 text-lg text-center u-text-gray-500">
      Build your next Vue.js application with confidence using Nuxt.
      An open source framework making web development simple and powerful.
    </p>
    <div class="flex gap-x-8">
      <UButton
        size="xl"
        variant="transparent"
        icon="fa-brands:github"
        label="39k + GithubStars"
        to="#"
      />
      <UButton size="xl" variant="primary" label="Get started" to="/getting-started/introduction" />
    </div>
  </div>
</template>
