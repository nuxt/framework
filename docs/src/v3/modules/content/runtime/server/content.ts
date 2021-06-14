import { getTransformer } from './transformers'
import { storage } from '#storage'

export async function getData (id) {
  return {
    body: await storage.getItem(id),
    meta: { mtime: new Date() }
    // meta: storage.getMeta(id)
  }
}

export async function getContent (id) {
  const data = await getData(id)
  if (!data.body) {
    throw new Error(`Content not found: ${id}`)
  }
  const transformResult = await getTransformer(id)(data.body)
  return {
    meta: {
      ...data.meta,
      ...transformResult.meta
    },
    body: transformResult.body
  }
}

export function getKeys (id) {
  return storage.getKeys(id)
}

export async function getList (id) {
  const ids = await getKeys(id)
  return Promise.all(ids.map(async (id) => {
    const content = await getContent(id)
    return {
      id,
      meta: content.meta
    }
  }))
}
