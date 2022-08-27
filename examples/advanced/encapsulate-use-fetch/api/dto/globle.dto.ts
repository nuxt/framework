import { Ref } from '@vue/runtime-dom'
export type DataT = {
  // data: Ref<DTOModel>
  pending: Ref<boolean>
  refresh: () => Promise<void>
  error: Ref<Error | boolean>
}
