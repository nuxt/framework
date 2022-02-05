import type { APIGatewayProxyHandler } from 'aws-lambda'
import '#polyfill'
import { withQuery } from 'ufo'
import { localCall } from '../server'

export const handler: APIGatewayProxyHandler = async function handler (event, context) {
  const r = await localCall({
    event,
    url: withQuery(event.path, event.queryStringParameters),
    context,
    headers: event.headers,
    method: event.httpMethod,
    query: event.queryStringParameters,
    body: event.body // TODO: handle event.isBase64Encoded
  })

  return {
    statusCode: r.status,
    headers: Object.fromEntries(Object.entries(r.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v])),
    body: r.body.toString()
  }
}
