import 'v8-compile-cache'
import * as c from 'colorette'
import mri from 'mri'
import { listen } from 'listhen'
import { version } from '../package.json'

const commands = {
  dev: {},
  build: {}
}

async function _main () {
  const _argv = process.argv.slice(2)
  const args = mri(_argv)
  const [command, rootDir] = args._

  if (!(command in commands)) {
    usage()
    process.exit(1)
  }

  const isDev = command === 'dev'

  let handler
  let listenerP
  if (isDev) {
    handler = (_req, res) => {
      res.setHeader('Content-Type', 'text/html; charset=UTF-8')
      res.end('<!DOCTYPE html><html><head><meta http-equiv="refresh" content="1"><head><body>...')
    }
    // https://github.com/unjs/listhen
    listenerP = listen((req, res) => { handler(req, res) }, { clipboard: true })
  }

  const { loadNuxt, build } = await import('nuxt3')
  const nuxt = await loadNuxt({
    for: isDev ? 'dev' : 'build',
    rootDir
  })

  if (isDev) {
    handler = nuxt.server.app
  }

  printTime('Starting build')
  await build(nuxt)

  const listener = await listenerP
  printTime('Ready')
  listener.open().catch(() => {})

  return Promise.resolve()
}

function usage () {
  console.log(`Usage: ${c.cyan(`nu ${Object.keys(commands).join('|')} [<rootDir>] [args]`)}`)
}

function measureTime () {
  if (!('_startTime' in process)) {
    return 0
  }
  // @ts-ignore
  return (Date.now() - process._startTime as number)
}

function printTime (pointName: string) {
  console.log(c.gray((`⧗ ${pointName} after ${c.bold(measureTime() + 'ms')}`)))
}

function onFatalError (err) {
  console.error(err)
  process.exit(1)
}

export function main () {
  console.log(c.green(`Nuxt CLI v${version}\n`))
  _main().catch(onFatalError)
}
