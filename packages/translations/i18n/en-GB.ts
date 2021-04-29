import { Translation } from './'

const translation: Translation = {
  cli: {
    loading: 'Loading Nuxt engine...',
    reloading: 'Reloading Nuxt engine...',
    ready: time => `Nuxt ready in ${time}ms`,
    loadError: 'Error while loading Nuxt. Please check console and fix errors.'
  }
}

export default translation
