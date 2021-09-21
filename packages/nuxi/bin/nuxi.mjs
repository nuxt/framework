#!/usr/bin/env node
import { createRequire } from 'module'

// https://github.com/unjs/unbuild/issues/7
process._startTime = Date.now()
globalThis.require = createRequire(import.meta.url)
globalThis.__filename = '.'
globalThis.__dirname = './'

import('../dist/index.mjs').then(r => (r.default || r).main())
