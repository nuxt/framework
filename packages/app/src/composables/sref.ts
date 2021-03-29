import { ref, Ref, UnwrapRef } from 'vue'

import { useHydration } from './hydrate'

/**
 * `ssrRef` will pass the server-side value of a ref to the client-side without re-evaluating it there.
 * @param value - This can be an initial value or a factory function that will be executed on server-side to get the initial value.
 * @param key - You should provide a unique key to ensure the data can be matched between client/server.
 * @example
  ```ts
  import { ssrRef } from 'nuxt/app/composables'

  const val = ssrRef('', 'key')

  // When hard-reloaded, `val` will be initialised to 'server set'
  if (process.server) val.value = 'server set'

  // When hard-reloaded, the result of myExpensiveSetterFunction() will
  // be encoded in nuxtState and used as the initial value of this ref.
  // If client-loaded, the setter function will run to come up with initial value.
  const val2 = ssrRef(myExpensiveSetterFunction)
  ```
 */
export function ssrRef<T> (value: T | (() => T), key: string): Ref<UnwrapRef<T>> {
  const initialValue = value instanceof Function ? value() : value
  const _ref = ref(initialValue)

  useHydration(key, () => _ref.value, (val) => { _ref.value = val })

  return _ref
}
