import { defineStore, acceptHMRUpdate } from 'pinia'

export const useStore = defineStore('storeId', {
  state: () => ({
    count: 100,
    name: 'Cupid Valentine'
  }),
  actions: {
    press () {
      this.count++
    }
  },

  getters: {
    getCount: state => state.count,
    getName: state => state.name
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot))
}
