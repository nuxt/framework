import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import '#polyfill'
import { withQuery } from 'ufo'
import { localCall } from '../server'

export const handler: APIGatewayProxyHandlerV2 = async function handler (event, context) {
  const r = await localCall({
    event,
    url: withQuery(event.rawPath, event.queryStringParameters),
    context,
    headers: event.headers,
    method: event.requestContext.http.method,
    query: event.queryStringParameters,
    body: event.body // TODO: handle event.isBase64Encoded
  })

  return {
    statusCode: r.status,
    headers: Object.fromEntries(Object.entries(r.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v])),
    body: r.body.toString()
  }
}
