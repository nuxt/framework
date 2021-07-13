export default {
  created () {
    const error = new Error('Page not found')
    error.statusCode = '404'
    throw error
  }
}
