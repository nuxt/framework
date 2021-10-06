import Vue from 'vue' // eslint-disable-line import/default
import VueCompositionAPI from '@vue/composition-api'

Vue.use(VueCompositionAPI.default || VueCompositionAPI)

Vue.mixin({
  setup () {
    const vm = getCurrentInstance()
    vm.type = vm.type || vm.proxy?.$options
  }
})

export default function () {}
