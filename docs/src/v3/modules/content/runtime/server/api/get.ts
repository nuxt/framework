import { getContent } from '../content'

export default async (req) => {
  const key = '/content' + req.url
  const content = await getContent(key)
  return {
    key,
    generatedAt: new Date(),
    ...content.meta,
    body: content.body
  }
}
