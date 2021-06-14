import markdown from './markdown'
import json from './json'

const transformers = {
  default: (body = '') => ({ body, meta: {} }),
  '.md': markdown,
  '.json': json
}

const exts = Object.keys(transformers)

export function getTransformer (id: string) {
  return transformers[exts.find(ext => id.endsWith(ext)) || 'default']
}
