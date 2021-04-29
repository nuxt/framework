import { Translation } from './'

const translation: Translation = {
  cli: {
    loading: 'Chargement de Nuxt...',
    reloading: 'Rechargement de Nuxt...',
    ready: time => `Nuxt prêt en ${time}ms`,
    loadError: 'Error while loading Nuxt. Please check console and fix errors.'
  }
}

export default translation
