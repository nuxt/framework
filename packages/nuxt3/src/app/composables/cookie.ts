import type { ServerResponse } from 'http'
import { Ref, ref, watch } from 'vue'
import type { CookieParseOptions, CookieSerializeOptions } from 'cookie'
import { parse, serialize } from 'cookie'
import { appendHeader } from 'h3'
import type { NuxtApp } from '@nuxt/schema'
import { useNuxtApp } from '#app'

type _CookieOptions = CookieSerializeOptions & CookieParseOptions
export interface CookieOptions extends _CookieOptions {}
export interface CookieRef extends Ref<string> {}

export function useCookie (name: string, opts: CookieOptions): CookieRef {
  const cookies = readRawCookies(opts)
  const cookie = ref(cookies[name]) as CookieRef

  if (process.client) {
    watch(cookie, () => { writeClientCookie(name, cookie.value, opts) })
  } else if (process.server) {
    const initialValue = cookie.value
    const nuxtApp = useNuxtApp()
    nuxtApp.hooks.hookOnce('app:rendered', () => {
      if (cookie.value !== initialValue) {
        // @ts-ignore
        writeServerCookie(useSSRRes(nuxtApp), name, cookie.value, opts)
      }
    })
  }

  return cookie
}

// @ts-ignore
function useSSRReq (nuxtApp?: NuxtApp = useNuxtApp()) { return nuxtApp.ssrContext?.req }

// @ts-ignore
function useSSRRes (nuxtApp?: NuxtApp = useNuxtApp()) { return nuxtApp.ssrContext?.res }

function readRawCookies (opts: CookieOptions = {}): Record<string, string> {
  if (process.server) {
    return parse(useSSRReq().headers.cookie || '', opts)
  } else if (process.client) {
    return parse(document.cookie, opts)
  }
}

function serializeCookie (name: string, value: string, opts: CookieSerializeOptions = {}) {
  if (value === null || value === undefined) {
    opts.maxAge = -1
  }
  return serialize(name, value, opts)
}

function writeClientCookie (name: string, value: string, opts: CookieSerializeOptions = {}) {
  if (process.client) {
    document.cookie = serializeCookie(name, value, opts)
  }
}

function writeServerCookie (res: ServerResponse, name: string, value: string, opts: CookieSerializeOptions = {}) {
  if (res) {
    // TODO: Try to smart join with exisiting Set-Cookie headers
    appendHeader(res, 'Set-Cookie', serializeCookie(name, value, opts))
  }
}
