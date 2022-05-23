import { computed, defineComponent, h, onBeforeUnmount, ref } from 'vue'
import { useNuxtApp } from '#app'

export default defineComponent({
  name: 'NuxtLoadingBar',
  props: {
    throttle: {
      type: Number,
      default: 200
    },
    duration: {
      type: Number,
      default: 2000
    },
    height: {
      type: Number,
      default: 3
    },
    color: {
      type: String,
      default: 'repeating-linear-gradient(to right,#00dc82 0%,#34cdfe 50%,#0047e1 100%)'
    }
  },
  setup (props) {
    const percent = ref(0)
    const show = ref(false)
    const step = computed(() => 10000 / props.duration)

    let _timer: any = null
    let _throttle: any = null

    function clear () {
      clearInterval(_timer)
      clearTimeout(_throttle)
      _timer = null
      _throttle = null
    }
    function start () {
      clear()
      percent.value = 0
      if (props.throttle) { _throttle = setTimeout(startTimer, props.throttle) } else { startTimer() }
    }
    function increase (num: number) {
      percent.value = Math.min(100, percent.value + num)
    }
    function finish () {
      percent.value = 100
      hide()
    }
    function hide () {
      clear()
      setTimeout(() => {
        show.value = false
        setTimeout(() => {
          percent.value = 0
        }, 400)
      }, 500)
    }
    function startTimer () {
      show.value = true
      _timer = setInterval(() => {
        increase(step.value)
      }, 100)
    }

    // Hooks
    const nuxtApp = useNuxtApp()
    nuxtApp.hook('page:start', start)
    nuxtApp.hook('page:finish', finish)
    onBeforeUnmount(() => clear)

    return () => h('div', {
      class: 'nuxt-progress',
      style: {
        position: 'fixed',
        top: 0,
        right: 0,
        left: 0,
        pointerEvents: 'none',
        width: `${percent.value}%`,
        height: `${props.height}px`,
        opacity: show.value ? 1 : 0,
        background: props.color,
        backgroundSize: `${(100 / percent.value) * 100}% auto`,
        transition: 'width 0.1s, height 0.4s, opacity 0.4s',
        zIndex: 999999
      }
    })
  }
})
