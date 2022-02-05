import type { APIGatewayProxyEvent, APIGatewayProxyEventV2, Context } from 'aws-lambda'
import '#polyfill'
import { withQuery } from 'ufo'
import { localCall } from '../server'

export const handler = async function handler (event: APIGatewayProxyEvent | APIGatewayProxyEventV2, context: Context) {
  let url: string
  let method: string

  if ('resource' in event) {
    // APIGatewayProxyEvent
    url = withQuery(event.path, event.queryStringParameters)
    method = event.httpMethod
  } else {
    // APIGatewayProxyEventV2
    url = withQuery(event.rawPath, event.queryStringParameters)
    method = event.requestContext.http.method
  }

  const r = await localCall({
    event,
    url,
    context,
    headers: event.headers,
    method,
    query: event.queryStringParameters,
    body: event.body // TODO: handle event.isBase64Encoded
  })

  return {
    statusCode: r.status,
    headers: Object.fromEntries(Object.entries(r.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v])),
    body: r.body.toString()
  }
}
