// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineNuxtRouteMiddleware(() => {
  const layoutName = setLayout()
  layoutName.value = 'test'
})
