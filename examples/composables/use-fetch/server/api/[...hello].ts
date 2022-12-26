export default defineEventHandler(event => {
  const { hello } = event.context.params;
  const query = getQuery(event);

  return {
    path: '/api/' + hello,
    query
  }
})

/*
  Do not forget that with Sugar Syntax the object { "query": query } is the same as the object { query }
*/
