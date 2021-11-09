import { ModuleContainer, NuxtRoute, ResolveAliasFn } from "@nuxt/kit"
import { resolve } from "pathe"

export default function (this: ModuleContainer) {
  this.extendRoutes(function (routes : NuxtRoute[], resolveAlias : ResolveAliasFn) {

    routes.push({
      name: 'Test',
      path: '/test',
      file: resolve(__dirname, './pages/test.vue'),
    })


    routes.push({
      name: 'Parent',
      path: '/parent',
      file: resolve(__dirname, './pages/parent.vue'),
      children: [
        {
          name: 'ChildrenOne',
          path: '/parent/childrenone',
          file: resolve(__dirname, './pages/children/childrenone.vue'),
        },
        {
          name: 'ChildrenTwo',
          path: '/parent/childretwo',
          file: resolve(__dirname, './pages/children/childrentwo.vue'),
        },
      ]
    })

    return routes
  })
}
