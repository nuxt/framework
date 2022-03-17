let counter = 0

export default (req) => {
  if (req.url === '?reset') {
    counter = 0
    return { count: counter }
  }
  return { count: counter++ }
}
