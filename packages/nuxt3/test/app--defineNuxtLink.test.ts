import { expect, describe, it, vi, beforeEach } from 'vitest'
import { RouteLocationRaw } from 'vue-router'
import { defineNuxtLink } from '../src/app/composables/defineNuxtLink'
import type { DefineNuxtLinkOptions, NuxtLinkProps } from '../src/app/composables/defineNuxtLink'

// Mocks `h()`
vi.mock('vue', async () => {
  const vue: Record<string, unknown> = await vi.importActual('vue')
  return {
    ...vue,
    resolveComponent: (name: string) => name,
    h: (...args) => args
  }
})

// Mocks Nuxt `useRouter()`
let hasVueRouter = false
const enableVueRouter = () => { hasVueRouter = true }
const disableVueRouter = () => { hasVueRouter = false }
vi.mock('#app', () => ({
  useRouter: () => hasVueRouter ? ({ resolve: ({ to }: { to: string }) => ({ href: to }) }) : undefined
}))

// Helpers for test lisibility
const EXTERNAL = 'a'
const INTERNAL = 'RouterLink'

// Renders a `<NuxtLink />`
const nuxtLink = (
  props: NuxtLinkProps = {},
  defineNuxtLinkOptions: DefineNuxtLinkOptions = {}
): { type: string, props: Record<string, unknown>, slots: unknown } => {
  const component = defineNuxtLink(defineNuxtLinkOptions)

  const [type, _props, slots] = (component.setup as unknown as (props: NuxtLinkProps, context: { slots: Record<string, () => unknown> }) =>
    () => [string, Record<string, unknown>, unknown])(props, { slots: { default: () => null } })()

  return { type, props: _props, slots }
}

describe('app--defineNuxtLink:to', () => {
  beforeEach(() => {
    disableVueRouter()
  })

  it('renders link with `to` prop', () => {
    expect(nuxtLink({ to: '/to' }).props.href).toBe('/to')
  })

  it('renders link with `href` prop', () => {
    expect(nuxtLink({ href: '/href' }).props.href).toBe('/href')
  })

  it('renders link with `to` prop and warns about `href` prop conflict', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn())

    expect(nuxtLink({ to: '/to', href: '/href' }).props.href).toBe('/to')
    expect(consoleWarnSpy).toHaveBeenCalledOnce()

    consoleWarnSpy.mockRestore()
  })

  it('throws when `to` and `href` props are empty', () => {
    expect(() => nuxtLink()).toThrowError(/NuxtLink/)
  })
})

describe('app--defineNuxtLink:isExternal', () => {
  describe('vue-router disabled', () => {
    beforeEach(() => {
      disableVueRouter()
    })

    it('always returns `true`', () => {
      expect(nuxtLink({ to: '/to' }).type).toBe(EXTERNAL)
      expect(nuxtLink({ to: 'https://nuxtjs.org' }).type).toBe(EXTERNAL)
    })

    it('ignores `external` prop and warns', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn())

      expect(nuxtLink({ to: '/to', external: true }).type).toBe(EXTERNAL)
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)

      consoleWarnSpy.mockRestore()
    })

    it('throws when used with a route location object', () => {
      expect(() => nuxtLink({ to: { to: '/to' } as RouteLocationRaw })).toThrowError(/NuxtLink/)
    })
  })

  describe('vue-router ensabled', () => {
    beforeEach(() => {
      enableVueRouter()
    })

    it('returns based on `to` value', () => {
      // Internal
      expect(nuxtLink({ to: '/foo' }).type).toBe(INTERNAL)
      expect(nuxtLink({ to: '/foo/bar' }).type).toBe(INTERNAL)
      expect(nuxtLink({ to: '/foo/bar?baz=qux' }).type).toBe(INTERNAL)

      // External
      expect(nuxtLink({ to: 'https://nuxtjs.org' }).type).toBe(EXTERNAL)
      expect(nuxtLink({ to: '//nuxtjs.org' }).type).toBe(EXTERNAL)
      expect(nuxtLink({ to: 'tel:0123456789' }).type).toBe(EXTERNAL)
      expect(nuxtLink({ to: 'mailto:hello@nuxtlabs.com' }).type).toBe(EXTERNAL)
    })

    it('returns `false` when `to` is a route location object', () => {
      expect(nuxtLink({ to: { to: '/to' } as RouteLocationRaw }).type).toBe(INTERNAL)
    })

    it('honors `external` prop', () => {
      expect(nuxtLink({ to: '/to', external: true }).type).toBe(EXTERNAL)
      expect(nuxtLink({ to: '/to', external: false }).type).toBe(INTERNAL)
    })

    it('returns `true` when using the `target` prop', () => {
      expect(nuxtLink({ to: '/foo', target: '_blank' }).type).toBe(EXTERNAL)
      expect(nuxtLink({ to: '/foo/bar', target: '_blank' }).type).toBe(EXTERNAL)
      expect(nuxtLink({ to: '/foo/bar?baz=qux', target: '_blank' }).type).toBe(EXTERNAL)
    })
  })
})

describe('app--defineNuxtLink:propsOrAttributes', () => {
  beforeEach(() => {
    enableVueRouter()
  })

  describe('`isExternal` is `true`', () => {
    describe('href', () => {
      it('forwards `to` value', () => {
        expect(nuxtLink({ to: 'https://nuxtjs.org' }).props.href).toBe('https://nuxtjs.org')
      })

      it('resolves route location object', () => {
        expect(nuxtLink({ to: { to: '/to' } as RouteLocationRaw, external: true }).props.href).toBe('/to')
      })
    })

    describe('target', () => {
      it('forwards `target` prop', () => {
        expect(nuxtLink({ to: 'https://nuxtjs.org', target: '_blank' }).props.target).toBe('_blank')
        expect(nuxtLink({ to: 'https://nuxtjs.org', target: null }).props.target).toBe(null)
      })

      it('defaults to `null`', () => {
        expect(nuxtLink({ to: 'https://nuxtjs.org' }).props.target).toBe(null)
      })
    })

    describe('rel', () => {
      it('uses framework\'s default', () => {
        expect(nuxtLink({ to: 'https://nuxtjs.org' }).props.rel).toBe('noopener noreferrer')
      })

      it('uses user\'s default', () => {
        expect(nuxtLink({ to: 'https://nuxtjs.org' }, { externalRelAttribute: 'foo' }).props.rel).toBe('foo')
        expect(nuxtLink({ to: 'https://nuxtjs.org' }, { externalRelAttribute: null }).props.rel).toBe(null)
      })

      it('uses and favors `rel` prop', () => {
        expect(nuxtLink({ to: 'https://nuxtjs.org', rel: 'foo' }).props.rel).toBe('foo')
        expect(nuxtLink({ to: 'https://nuxtjs.org', rel: 'foo' }, { externalRelAttribute: 'bar' }).props.rel).toBe('foo')
        expect(nuxtLink({ to: 'https://nuxtjs.org', rel: null }, { externalRelAttribute: 'bar' }).props.rel).toBe(null)
      })

      it('honors `noRel` prop', () => {
        expect(nuxtLink({ to: 'https://nuxtjs.org', noRel: true }).props.rel).toBe(null)
        expect(nuxtLink({ to: 'https://nuxtjs.org', noRel: false }).props.rel).toBe('noopener noreferrer')
      })

      it('honors `noRel` prop and warns about `rel` prop conflict', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn())

        expect(nuxtLink({ to: 'https://nuxtjs.org', noRel: true, rel: 'foo' }).props.rel).toBe(null)
        expect(consoleWarnSpy).toHaveBeenCalledOnce()

        consoleWarnSpy.mockRestore()
      })
    })
  })

  describe('`isExternal` is `false`', () => {
    describe('to', () => {
      it('forwards `to` prop', () => {
        expect(nuxtLink({ to: '/to' }).props.to).toBe('/to')
        expect(nuxtLink({ to: { to: '/to' } as RouteLocationRaw }).props.to).toEqual({ to: '/to' })
      })
    })

    describe('activeClass', () => {
      it('uses framework\'s default', () => {
        expect(nuxtLink({ to: '/to' }).props.activeClass).toBe(undefined)
      })

      it('uses user\'s default', () => {
        expect(nuxtLink({ to: '/to' }, { activeClass: 'activeClass' }).props.activeClass).toBe('activeClass')
      })

      it('uses and favors `activeClass` prop', () => {
        expect(nuxtLink({ to: '/to', activeClass: 'propActiveClass' }).props.activeClass).toBe('propActiveClass')
        expect(nuxtLink({ to: '/to', activeClass: 'propActiveClass' }, { activeClass: 'activeClass' }).props.activeClass).toBe('propActiveClass')
      })
    })

    describe('exactActiveClass', () => {
      it('uses framework\'s default', () => {
        expect(nuxtLink({ to: '/to' }).props.exactActiveClass).toBe(undefined)
      })

      it('uses user\'s default', () => {
        expect(nuxtLink({ to: '/to' }, { exactActiveClass: 'exactActiveClass' }).props.exactActiveClass).toBe('exactActiveClass')
      })

      it('uses and favors `exactActiveClass` prop', () => {
        expect(nuxtLink({ to: '/to', exactActiveClass: 'propExactActiveClass' }).props.exactActiveClass).toBe('propExactActiveClass')
        expect(nuxtLink({ to: '/to', exactActiveClass: 'propExactActiveClass' }, { exactActiveClass: 'exactActiveClass' }).props.exactActiveClass).toBe('propExactActiveClass')
      })
    })

    describe('replace', () => {
      it('forwards `replace` prop', () => {
        expect(nuxtLink({ to: '/to', replace: true }).props.replace).toBe(true)
        expect(nuxtLink({ to: '/to', replace: false }).props.replace).toBe(false)
      })
    })

    describe('ariaCurrentValue', () => {
      it('forwards `ariaCurrentValue` prop', () => {
        expect(nuxtLink({ to: '/to', ariaCurrentValue: 'page' }).props.ariaCurrentValue).toBe('page')
        expect(nuxtLink({ to: '/to', ariaCurrentValue: 'step' }).props.ariaCurrentValue).toBe('step')
      })
    })
  })
})
