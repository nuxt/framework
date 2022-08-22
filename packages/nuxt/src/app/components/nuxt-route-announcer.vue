<template>
  <p
    class="nuxtjs-route-announcer"
    aria-live="assertive"
    id="__nuxt-route-announcer__"
    role="alert"
  >
    {{ routeAnnouncement }}
  </p>
</template>

<script setup>
import { shallowRef, watchEffect } from "vue";
import { useRoute } from "#app";

const previouslyLoadedPath = shallowRef(useRoute().fullPath);
const routeAnnouncement = shallowRef("");

watchEffect(() => {
  if (previouslyLoadedPath.value === useRoute().fullPath) return;
  previouslyLoadedPath.value === useRoute().fullPath;
  if (document?.title) {
    routeAnnouncement.value = document?.title;
  } else {
    const nuxtPageHeader = document?.querySelector?.("h1");
    const nuxtContent =
      nuxtPageHeader?.innerText ?? nuxtPageHeader?.textContent;

    routeAnnouncement.value = nuxtContent || useRoute()?.fullPath;
  }
});
</script>

<style scoped>
.nuxtjs-route-announcer{
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  white-space: nowrap;
  word-wrap: normal;
}
</style>
