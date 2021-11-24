<template>
  <li :class="{ active: isActive }">
    <h5 v-if="title" class="d-aside-title" :class="[isActive ? '' : 'lg:hover:d-primary-text-hover']" @click="toggle">
      {{ title }}
    </h5>
    <ul v-if="!collapse || isActive" class="mb-2 ml-2">
      <li v-for="doc of docs" :key="doc.to">
        <NuxtLink
          :to="$contentLocalePath(doc.redirect || doc.to)"
          class="block w-full"
          :class="[
            $docus.isLinkActive(doc.to)
              ? 'd-active-aside-navigation-item-text'
              : 'd-secondary-text hover:d-secondary-text-hover'
          ]"
        >
          <span
            class="relative inline-flex items-center justify-between px-2 py-1 rounded-md"
            :class="[$docus.isLinkActive(doc.to) ? 'd-active-aside-navigation-item-bg' : '']"
          >
            <InjectComponent
              v-if="doc.icon"
              :component="doc.icon"
              class="inline-flex mr-2 w-5 h-5 justify-center items-center text-1.2rem"
            >
              {{ doc.icon }}
            </InjectComponent>

            <span>
              {{ doc.title }}
            </span>

            <span v-if="doc.bridge" class="ml-2">
              <IconNuxtBridgeSimple class="h-4 w-auto" />
            </span>

            <ClientOnly>
              <span v-if="doc.draft" class="w-2 h-2 ml-2 bg-yellow-500 rounded-full opacity-75" />
              <span
                v-else-if="isDocumentNew(doc)"
                class="w-2 h-2 ml-2 rounded-full opacity-75 animate-pulse bg-primary-500"
              />
            </ClientOnly>
          </span>
        </NuxtLink>
      </li>
    </ul>
  </li>
</template>

<script>
import { computed, defineComponent, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    title: {
      type: String,
      default: ''
    },
    docs: {
      type: Array,
      required: true
    },
    collapse: {
      type: Boolean,
      default: false
    }
  },
  setup (props, { emit }) {
    const { $docus } = useContext()

    const isActive = computed(() => props.docs.some(document => $docus.isLinkActive(document.to)))

    const toggle = () => {
      if (isActive.value) { return }

      emit('update:collapse', !props.collapse)
    }

    const isDocumentNew = (document) => {
      if (process.server) { return }

      if (!document.version || document.version <= 0) { return }

      const version = localStorage.getItem(`document-${document.slug}-version`)

      if (document.version > Number(version)) { return true }

      return false
    }

    return {
      toggle,
      isActive,
      isDocumentNew
    }
  }
})
</script>
