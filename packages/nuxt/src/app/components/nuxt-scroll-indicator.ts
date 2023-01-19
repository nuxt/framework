import { defineComponent, h, onBeforeUnmount, ref } from 'vue';
import { useNuxtApp } from '#app';

export default defineComponent({
  name: 'NuxtScrollIndicator',
  props: {
    height: {
      type: Number,
      default: 3,
    },
    color: {
      type: String,
      default: 'linear-gradient(to right, #00dc82 0%,#34cdfe 50%,#0047e1 100%)',
    },
    background: {
      type: String,
      default: 'transparent',
    },
    shadow: {
      type: String,
      default: 'none',
    },
    borderRadius: {
      type: Number,
      default: 0,
    },
    elementId: {
      type: String,
      required: false,
    },
  },
  setup(props, { slots }) {
    const indicator = useScrollIndicator(props.elementId);

    const nuxtApp = useNuxtApp();
    nuxtApp.hook('app:mounted', indicator.init);
    onBeforeUnmount(() => indicator.clear());

    return () => h('div', {
        class: 'nuxt-scroll-indicator-wrapper',
        style: {
          position: 'fixed',
          zIndex: 999998,
          right: 0,
          left: 0,
          top: 0,
          pointerEvents: 'none',
          height: `${props.height}px`,
          background: props.background,
        },
      },
      [
        h('div', {
          class: 'nuxt-scroll-indicator',
          style: {
            height: '100%',
            background: props.color,
            boxShadow: props.shadow,
            borderRadius: `${props.borderRadius}px`,
            width: indicator.width.value + '%',
          },
        }, slots),
      ]
    );
  },
});

function useScrollIndicator(element ? : string) {
  const width = ref < number > (0);
  const content = ref < number > (0);

  function onScroll() {
    const { documentElement, body } = document;
    const windowScroll = documentElement.scrollTop - content.value || body.scrollTop;
    const height = documentElement.scrollHeight - (documentElement.clientHeight + content.value);
    if (windowScroll > 0) {
      width.value = (windowScroll / height) * 100;
    } else {
      width.value = 0;
    }
  }

  function init() {
    if (element != undefined) {
      var elementTargetTop = document.getElementById(element)?.offsetTop || 0;
      // TODO: Add breakpoints for mobile
      content.value = elementTargetTop;
    }
    window.addEventListener('scroll', onScroll);
  }

  function clear() {
    window.removeEventListener('scroll', onScroll);
  }

  return {
    width,
    init,
    clear
  };
}
