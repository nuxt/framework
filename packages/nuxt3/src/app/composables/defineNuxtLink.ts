import { defineComponent, h, resolveComponent, PropType, computed } from 'vue'
import { RouteLocationRaw, Router } from 'vue-router'

import { useRouter } from '#app'

/**
 * Determines if a URL is internal or external. This does not detect all relative URLs as internal, such as `about` or `./about`. This function assumes relative URLs start with a "/"`.
 */
const isExternalURL = (url: string): boolean => {
  /**
   * @see Regex101 expression: {@link https://regex101.com/r/1y7iod/1}
   */
  // TODO: Use `ufo.hasProtocol` when issue fixed https://github.com/unjs/ufo/issues/45
  return !/^\/(?!\/)/.test(url)
}

const firstNonUndefined = <T>(...args: T[]): T => {
  for (const arg of args) {
    if (arg !== undefined) {
      return arg
    }
  }
}

const DEFAULT_COMPONENT_NAME = 'NuxtLink'
const DEFAULT_PREFETCH_LINKS = true
const DEFAULT_EXTERNAL_REL_ATTRIBUTE = 'noopener noreferrer'

export type DefineNuxtLinkOptions = {
  componentName?: string;
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
  target?: string;
  rel?: string;
  noRel?: boolean;

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

  // Slot API
  custom?: boolean;
};

const checkPropConflicts = (props: NuxtLinkProps, main: string, sub: string): void => {
  if (props[main] !== undefined && props[sub] !== undefined) {
    console.warn(`[NuxtLink] \`${main}\` and \`${sub}\` cannot be used together. \`${sub}\` will be ignored.`)
  }
}

export function defineNuxtLink (options: DefineNuxtLinkOptions = {}) {
  return defineComponent({
    name: options.componentName || DEFAULT_COMPONENT_NAME,
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

      // Resolving `to` value from `to` and `href` props
      const to = computed<string | RouteLocationRaw>(() => {
        checkPropConflicts(props, 'to', 'href')

        return props.to || props.href || '' // Defaults to empty string (won't render any `href` attribute)
      })

      // Resolving link type
      const isExternal = computed<boolean>(() => {
        if (!router) {
          // If Vue Router is not enabled then all links are considered external

          if (typeof to.value === 'object') {
            throw new TypeError('[NuxtLink] Route location object cannot be resolved by `<NuxtLink />` when vue-router is disabled (no pages).')
          }

          if (props.external !== undefined) {
            console.warn('[NuxtLink] `external` prop have no effect when Vue Router is not enabled.')
          }

          return true
        }

        // If Vue Router is enabled, then check if link is internal or external

        if (props.external !== undefined) {
          // Else if `external` prop is used
          return props.external
        } else if (props.target) {
          // Else if the `blank` or `target` props are truthy, then link is considered external
          return true
        } else if (typeof to.value === 'object') {
          // Else if `to` is a route object then it's an internal link
          return false
        }

        // Else check if `to` is an external URL
        return isExternalURL(to.value)
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
        if (isExternal.value) {
          // External props

          // Resolves `to` value if it's a route location object
          const href = typeof to.value === 'object' ? router?.resolve(to.value).href : to.value || null // converts `""` to `null` to prevent the attribute from being added as empty (`href=""`)

          // Resolves `target` value
          const target = props.target || null

          // Resolves `rel`
          checkPropConflicts(props, 'noRel', 'rel')
          const rel = props.noRel
            ? null
            : firstNonUndefined<string | null>(props.rel, options.externalRelAttribute, DEFAULT_EXTERNAL_REL_ATTRIBUTE) || null // converts `""` to `null` to prevent the attribute from being added as empty (`rel=""`)

          return { href, target, rel }
        }

        // Internal props
        return {
          to: to.value,
          activeClass: props.activeClass || options.activeClass,
          exactActiveClass: props.exactActiveClass || options.exactActiveClass,
          replace: props.replace,
          ariaCurrentValue: props.ariaCurrentValue
        }
      })

      // TODO: Just resolved for now, requires prefetching implementation
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const shouldPrefetch = computed<boolean>(() => {
        checkPropConflicts(props, 'prefetch', 'noPrefetch')

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
          isExternal.value ? 'a' : resolveComponent('RouterLink'),
          propsOrAttributes.value,
          // TODO: Slot API
          slots.default()
        )
      }
    }
  })
}
