export default function transformJSON (input: string | object) {
  if (typeof input === 'string') {
    return { body: JSON.parse(body) }
  }
  return { body: input }
}
