export default defineNuxtPlugin(() => {
  return {
    provide: {
      myPlugin: () => 'String generated from my auto-imported plugin!'
    }
  }
})
