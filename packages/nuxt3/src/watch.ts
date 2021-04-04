import chokidar, { WatchOptions } from 'chokidar'
import defu from 'defu'
import consola from 'consola'

import Ignore from './utils/ignore'

export interface WatchEvent {
  event: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir'
  path: string
}

export type WatchCallback = (event: WatchEvent) => void
export type WatchFilter = (event: WatchEvent) => boolean | null

export function createWatcher (
  pattern: string,
  options?: WatchOptions,
  ignore?: Ignore
) {
  const opts = defu(options || {}, {
    ignored: [],
    ignoreInitial: true
  })
  const watcher = chokidar.watch(pattern, opts)
  const watchAll = (cb: WatchCallback, filter?: WatchFilter) => {
    watcher.on('all', (event, path: string) => {
      if (ignore && ignore.ignores(path)) {
        return
      }
      const _event = { event, path }
      if (!filter || filter(_event)) {
        cb(_event)
      }
    })
  }

  const watch = (pattern: string | RegExp, cb: WatchCallback, events?: string[]) =>
    watchAll(cb, ({ event, path }) => path.match(pattern) && (!events || events.includes(event)))

  const debug = (tag: string = '[Watcher]') => {
    consola.log(tag, 'Watching ', pattern)
    watchAll((e) => {
      consola.log(tag, e.event, e.path)
    })
  }

  return {
    watchAll,
    watch,
    debug,
    close: () => watcher.close()
  }
}

export type Watcher = ReturnType<typeof createWatcher>
