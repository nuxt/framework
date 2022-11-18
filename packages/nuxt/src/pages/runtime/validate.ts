import { RouteLocation } from 'vue-router'

export default async (to: RouteLocation) => {
  if (!to.meta?.validate) { return }

  const result = await Promise.resolve(to.meta.validate(to))
  if (result === true) {
    return
  }
  return result
}
