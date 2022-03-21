import { useMotion } from '@vueuse/motion'
import type { MotionInstance } from '@vueuse/motion'
import type { Ref } from 'vue'

export const useCollapsible = (
  emit: (...props: any) => void,
  collapsible: Ref<HTMLElement>,
  item: Ref<HTMLElement>,
  wrapper: Ref<HTMLElement>,
  padding: Number
) => {
  const opened = ref(true)
  const itemHeight = ref()
  const wrapperHeight = ref()

  let collapsibleMotion: MotionInstance<any>

  function initCollapsible (): void {
    itemHeight.value = item.value?.clientHeight
    wrapperHeight.value = item.value?.clientHeight

    collapsibleMotion = useMotion(collapsible, {
      initial: {
        height: itemHeight.value + wrapperHeight.value + padding
      },
      open: {
        height: itemHeight.value + wrapperHeight.value + padding,
        transition: {
          ease: 'ease-in',
          duration: 500
        }
      },
      close: {
        height: itemHeight.value,
        transition: {
          ease: 'circOut',
          duration: 250
        }
      }
    })

    collapsibleMotion.set('initial')
  }

  function collapse (): void {
    opened.value = !opened.value

    if (opened.value) { collapsibleMotion.apply('open') } else { collapsibleMotion.apply('close') }

    emit('collapse')
  }

  onMounted(() => {
    initCollapsible()
    window.addEventListener('resize', initCollapsible)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', initCollapsible)
  })

  return {
    collapse,
    collapsible,
    item,
    wrapper,
    itemHeight,
    wrapperHeight,
    opened
  }
}
