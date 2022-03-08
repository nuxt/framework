import { defineComponent, h, resolveComponent, PropType, computed } from 'vue'
import { RouteLocationRaw, Router } from 'vue-router'

import { useRouter } from '#app'

/**
 * Determines if a URL is internal or external. This does not detect all relative URLs as internal, such as `about` or `./about`. This function assumes relative URLs start with a "/"`.
 */
const isInternalURL = (url: string): boolean => {
  /**
   * @see Regex101 expression: {@link https://regex101.com/r/1y7iod/1}
   */
  const isInternal = /^\/(?!\/)/.test(url)
  /**
   * @see Regex101 expression: {@link https://regex101.com/r/RnUseS/1}
   */
  const isSpecialLink = !isInternal && !/^https?:\/\//i.test(url)

  return isInternal && !isSpecialLink
}

const firstNonUndefined = <T>(...args: T[]): T => {
  for (const arg of args) {
    if (arg !== undefined) {
      return arg
    }
  }
}

const warnPropConflict = (main: string, sub: string): void => {
  console.warn(`[NuxtLink] \`${main}\` and \`${sub}\` cannot be used together. \`${sub}\` will be ignored.`)
}

const DEFAULT_PREFETCH_LINKS = true
const DEFAULT_EXTERNAL_REL_ATTRIBUTE = 'noopener noreferrer'

export type DefineNuxtLinkOptions = {
  prefetchLinks?: boolean;
  externalRelAttribute?: string | null;
  activeClass?: string;
  exactActiveClass?: string;
  prefetchedClass?: string;
}

export type NuxtLinkProps = {
  // Routing
  to?: string | RouteLocationRaw;
  href?: string | RouteLocationRaw;

  // Attributes
  blank?: boolean;
  target?: string;
  rel?: string | null;

  // Prefetching
  prefetch?: boolean;
  noPrefetch?: boolean;

  // Styling
  activeClass?: string;
  exactActiveClass?: string;
  prefetchedClass?: string;

  // Vue Router's `<RouterLink>` additional props
  replace?: boolean;
  ariaCurrentValue?: string;

  // Edge cases handling
  external?: boolean;
  internal?: boolean;

  // Slot API
  custom?: boolean;
};

export function defineNuxtLink (options: DefineNuxtLinkOptions = {}) {
  return defineComponent({
    name: 'NuxtLink',
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
      blank: {
        type: Boolean as PropType<boolean>,
        default: undefined,
        required: false
      },
      target: {
        type: String as PropType<string>,
        default: undefined,
        required: false
      },
      rel: {
        type: String as PropType<string | null>,
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
      internal: {
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

      // Resolving `to` value from `to` and `href` props
      const to = computed<string | RouteLocationRaw>(() => {
        if (props.to) {
          if (props.href) {
            warnPropConflict('to', 'href')
          }
          return props.to
        } else if (props.href) {
          return props.href
        } else {
          throw new Error('[NuxtLink] Missing `to` prop.')
        }
      })

      // Resolving link type
      const type = computed<'internal' | 'external'>(() => {
        if (!router) {
          // If Vue Router is not enabled then all links are considered external
          if (typeof to.value === 'object') {
            throw new TypeError('[NuxtLink] Vue Router is not enabled, therefore route location object cannot be handled by `<NuxtLink />`.')
          }

          if (props.external !== undefined || props.internal !== undefined) {
            console.warn('[NuxtLink] `external` and `internal` props have no effect when Vue Router is not enabled.')
          }

          return 'external'
        } else if (props.external !== undefined) {
          // Else if `external` prop is used
          if (props.internal !== undefined) {
            console.log({ e: props.external, i: props.internal })
            warnPropConflict('external', 'internal')
          }
          return props.external ? 'external' : 'internal'
        } else if (props.internal !== undefined) {
          // Else if `internal` prop is used
          return props.internal ? 'internal' : 'external'
        } else if (props.blank || props.target) {
          // Else if the `blank` or `target` props are truthy, then link is considered external
          return 'external'
        } else if (typeof to.value === 'object') {
          // Else if `to` is a route object then it's an internal link
          return 'internal'
        } else {
          // Else check if `to` is an internal URL
          return isInternalURL(to.value) ? 'internal' : 'external'
        }
      })

      // Resolving props for internal links of attributes for external ones
      const propsOrAttributes = computed<{
        to: string | RouteLocationRaw;
        activeClass?: string;
        exactActiveClass?: string;
        replace?: boolean;
        ariaCurrentValue?: string;
      } | {
        href: string | null;
        target: string | null;
        rel: string | null;
      }>(() => {
        if (type.value === 'internal') {
          // Internal props
          return {
            to: to.value,
            activeClass: props.activeClass || options.activeClass,
            exactActiveClass: props.exactActiveClass || options.exactActiveClass,
            replace: props.replace,
            ariaCurrentValue: props.ariaCurrentValue
          }
        } else {
          // External props

          // Resolves `to` value if it's a route location object
          const href = typeof to.value === 'object' ? router?.resolve(to.value).href : to.value

          // Resolves `target` value
          let target = null
          if (props.target !== undefined) {
            target = props.target
          } else if (props.blank) {
            target = '_blank'
          }
          if (props.blank !== undefined && props.target !== undefined) {
            warnPropConflict('target', 'blank')
          }

          // Resolves `rel`
          const rel = firstNonUndefined<string | null>(props.rel, options.externalRelAttribute, DEFAULT_EXTERNAL_REL_ATTRIBUTE)

          return { href, target, rel }
        }
      })

      // TODO: Just resolved for now, requires prefetching implementation
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const shouldPrefetch = computed<Boolean>(() => {
        if (props.prefetch !== undefined && props.noPrefetch !== undefined) {
          warnPropConflict('prefetch', 'noPrefetch')
        }

        return firstNonUndefined(
          props.prefetch,
          // `noPrefetch` needs to be inverted
          props.noPrefetch !== undefined ? !props.noPrefetch : undefined,
          options.prefetchLinks,
          DEFAULT_PREFETCH_LINKS
        )
      })
      // TODO: Update when prefetching is implemented
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const prefetchedClass = computed<string | null>(() => null)

      return () => {
        // TODO: Handle `custom` prop
        return h(
          type.value === 'internal' ? resolveComponent('RouterLink') : 'a',
          propsOrAttributes.value,
          // TODO: Slot API
          slots.default()
        )
      }
    }
  })
}
