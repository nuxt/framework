import { H3Event } from 'h3'

/**
 *  Event can be a url or an object of type h3Event
 */
export function useDecodeURI (event: string | H3Event) {
  if (typeof event === 'string') {
    try {
      return decodeURI(event)
    } catch {
      return event
    }
  } else {
    const referer = (event.req.headers.referer as string).replace(/\/$/, '')
    const url = referer + event.req.url
    console.log(url)
    const decoded = decodeURI(url)
    return {
      url: decoded,
      params: difference(url, decoded)
    }
  }
}
function difference (oldURL:string, newURL: string) {
  const old = oldURL.split('/')
  const fresh = newURL.split('/')
  const diff = fresh.filter((item, index) => item !== old[index])
  if (diff.length === 1) {
    return diff[0]
  } else {
    return diff
  }
}
