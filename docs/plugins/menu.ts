export default defineNuxtPlugin((ctx: any) => {
  const scrollBarGap = ref()
  // Menu visible reference
  const visible = ref(false)

  // Current tab visible reference
  const currentTab = ref()

  // Open the menu
  const open = () => (visible.value = true)

  // Close the menu
  const close = () => (visible.value = false)

  // Toggle the menu (useful for one-off buttons)
  const toggle = () => (visible.value = !visible.value)

  // Toggle a tab from its id
  const toggleTab = (tab: string) =>
    currentTab.value === tab ? (currentTab.value = undefined) : (currentTab.value = tab)

  // Watch route change, close on change
  ctx.$router.afterEach(() => setTimeout(close, 50))

  // Watch visible and remove overflow so the scrollbar disappears when menu is opened
  if (process.client) {
    watch(
      visible,
      (isVisible) => {
        if (isVisible) {
          scrollBarGap.value = window.innerWidth - document.documentElement.clientWidth
          document.body.style.overflow = 'hidden'
          document.body.style.paddingRight = `${scrollBarGap.value}px`
        } else {
          setTimeout(() => {
            document.body.style.overflow = ''
            document.body.style.paddingRight = ''
          }, 100) /* had to put it, because of layout shift on leave transition */
        }
      },
      {
        immediate: true
      }
    )
  }

  // Inject menu
  ctx.provide('menu', {
    scrollBarGap,
    visible,
    close,
    open,
    toggle,
    currentTab,
    toggleTab
  })
})
