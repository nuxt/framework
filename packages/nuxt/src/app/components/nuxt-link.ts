import { defineComponent, h, ref, onBeforeUnmount, onMounted, resolveComponent, PropType, computed, DefineComponent } from 'vue'
import { RouteLocationRaw, Router, RouteComponent } from 'vue-router'
import { hasProtocol } from 'ufo'

import { useRouter } from '#app'

const firstNonUndefined = <T>(...args: T[]): T => args.find(arg => arg !== undefined)

type CallbackFn = () => void
type Lazy<T> = () => Promise<T>

const requestIdleCallback: Window['requestIdleCallback'] = process.client
  ? window.requestIdleCallback || function (cb) {
    const start = Date.now()
    const idleDeadline = {
      didTimeout: false,
      timeRemaining () {
        return Math.max(0, 50 - (Date.now() - start))
      }
    }
    return window.setTimeout(function () {
      cb(idleDeadline)
    }, 1)
  }
  : (() => {}) as any

const cancelIdleCallback: Window['cancelIdleCallback'] = process.client
  ? window.cancelIdleCallback || function (id) {
    clearTimeout(id)
  }
  : () => {}

let observer: IntersectionObserver | null = null
const callbacks = new Map<Element, CallbackFn>()
function observe (element: Element, callback: CallbackFn) {
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const callback = callbacks.get(entry.target)
        const isVisible = entry.isIntersecting || entry.intersectionRatio > 0

        if (isVisible) {
          callback?.()
        }
      })
    })
  }

  callbacks.set(element, callback)
  observer.observe(element)

  return function unobserve () {
    callbacks.delete(element)
    observer.unobserve(element)

    if (callbacks.size === 0) {
      observer.disconnect()
      observer = null
    }
  }
}

const prefetcheds = new Set()

const DEFAULT_EXTERNAL_REL_ATTRIBUTE = 'noopener noreferrer'

export type NuxtLinkOptions = {
  componentName?: string;
  externalRelAttribute?: string | null;
  activeClass?: string;
  exactActiveClass?: string;
  prefetchedClass?: string
}

export type NuxtLinkProps = {
  // Routing
  to?: string | RouteLocationRaw;
  href?: string | RouteLocationRaw;
  external?: boolean;

  // Attributes
  target?: string;
  rel?: string;
  noRel?: boolean;

  prefetch?: boolean
  noPrefetch?: boolean

  // Styling
  activeClass?: string;
  exactActiveClass?: string;
  prefetchedClass?: string

  // Vue Router's `<RouterLink>` additional props
  replace?: boolean;
  ariaCurrentValue?: string;
};

export function defineNuxtLink (options: NuxtLinkOptions) {
  const componentName = options.componentName || 'NuxtLink'

  const checkPropConflicts = (props: NuxtLinkProps, main: string, sub: string): void => {
    if (process.dev && props[main] !== undefined && props[sub] !== undefined) {
      console.warn(`[${componentName}] \`${main}\` and \`${sub}\` cannot be used together. \`${sub}\` will be ignored.`)
    }
  }

  return defineComponent({
    name: componentName,
    props: {
      // Routing
      to: {
        type: [String, Object] as PropType<string | RouteLocationRaw>,
        default: undefined,
        required: false
      },
      href: {
        type: [String, Object] as PropType<string | RouteLocationRaw>,
        default: undefined,
        required: false
      },

      // Attributes
      target: {
        type: String as PropType<string>,
        default: undefined,
        required: false
      },
      rel: {
        type: String as PropType<string>,
        default: undefined,
        required: false
      },
      noRel: {
        type: Boolean as PropType<boolean>,
        default: undefined,
        required: false
      },

      // Prefetching
      prefetch: {
        type: Boolean as PropType<boolean>,
        default: undefined,
        required: false
      },
      noPrefetch: {
        type: Boolean as PropType<boolean>,
        default: undefined,
        required: false
      },

      // Styling
      activeClass: {
        type: String as PropType<string>,
        default: undefined,
        required: false
      },
      exactActiveClass: {
        type: String as PropType<string>,
        default: undefined,
        required: false
      },
      prefetchedClass: {
        type: String as PropType<string>,
        default: undefined,
        required: false
      },

      // Vue Router's `<RouterLink>` additional props
      replace: {
        type: Boolean as PropType<boolean>,
        default: undefined,
        required: false
      },
      ariaCurrentValue: {
        type: String as PropType<string>,
        default: undefined,
        required: false
      },

      // Edge cases handling
      external: {
        type: Boolean as PropType<boolean>,
        default: undefined,
        required: false
      },

      // Slot API
      custom: {
        type: Boolean as PropType<boolean>,
        default: undefined,
        required: false
      }
    },
    setup (props, { slots }) {
      const router = useRouter() as Router | undefined

      const nodeRef = ref<HTMLElement>(null)
      const setNodeRef = (ref: object | null) => {
        nodeRef.value = ref || '$el' in ref ? (ref as { $el: HTMLElement }).$el : null
      }

      // Resolving `to` value from `to` and `href` props
      const to = computed<string | RouteLocationRaw>(() => {
        checkPropConflicts(props, 'to', 'href')

        return props.to || props.href || '' // Defaults to empty string (won't render any `href` attribute)
      })

      // Resolving link type
      const isExternal = computed<boolean>(() => {
        // External prop is explictly set
        if (props.external) {
          return true
        }

        // When `target` prop is set, link is external
        if (props.target && props.target !== '_self') {
          return true
        }

        // When `to` is a route object then it's an internal link
        if (typeof to.value === 'object') {
          return false
        }

        return to.value === '' || hasProtocol(to.value, true)
      })

      const prefetched = ref(false)
      const shouldPrefetch = computed(() => {
        checkPropConflicts(props, 'prefetch', 'noPrefetch')

        return props.prefetch == null
          ? props.noPrefetch == null ? true : !props.noPrefetch
          : props.prefetch
      })

      let idleId: number
      let unobserve: ReturnType<typeof observe> | null = null

      const prefetch = () => {
        const cn = navigator.connection as any
        if (cn && (cn.saveData || /2g/.test(cn.effectiveType))) { return }

        const components = router.resolve(to.value).matched
          .map(component => component.components.default)
          .filter(component => typeof component === 'function' && !prefetcheds.has(component))

        const promises = []
        components.forEach((component: Lazy<RouteComponent>) => {
          const promise = component()
          if (promise instanceof Promise) {
            promise.catch(() => {})
          }
          promises.push(promise)
          prefetcheds.add(component)
        })

        Promise.all(promises).then(() => {
          prefetched.value = true
        })
      }

      onMounted(() => {
        if (!shouldPrefetch.value) { return }

        idleId = requestIdleCallback(() => {
          unobserve = observe(nodeRef.value, () => {
            prefetch()

            unobserve?.()
            unobserve = null
          })
        })
      })

      onBeforeUnmount(() => {
        cancelIdleCallback(idleId)
        unobserve?.()
      })

      return () => {
        if (!isExternal.value) {
          // Internal link
          return h(
            resolveComponent('RouterLink'),
            {
              ref: setNodeRef,
              to: to.value,
              class: prefetched.value && (props.prefetchedClass || options.prefetchedClass),
              activeClass: props.activeClass || options.activeClass,
              exactActiveClass: props.exactActiveClass || options.exactActiveClass,
              replace: props.replace,
              ariaCurrentValue: props.ariaCurrentValue
            },
            // TODO: Slot API
            slots.default
          )
        }

        // Resolves `to` value if it's a route location object
        // converts `'''` to `null` to prevent the attribute from being added as empty (`href=""`)
        const href = typeof to.value === 'object' ? router.resolve(to.value)?.href ?? null : to.value || null

        // Resolves `target` value
        const target = props.target || null

        // Resolves `rel`
        checkPropConflicts(props, 'noRel', 'rel')
        const rel = (props.noRel)
          ? null
          // converts `""` to `null` to prevent the attribute from being added as empty (`rel=""`)
          : firstNonUndefined<string | null>(props.rel, options.externalRelAttribute, href ? DEFAULT_EXTERNAL_REL_ATTRIBUTE : '') || null

        return h('a', { href, rel, target }, slots.default?.())
      }
    }
  }) as unknown as DefineComponent<NuxtLinkProps>
}

export default defineNuxtLink({ componentName: 'NuxtLink' })
