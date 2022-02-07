import type { APIGatewayProxyEvent, APIGatewayProxyEventHeaders, APIGatewayProxyEventV2, Context } from 'aws-lambda'
import '#polyfill'
import { withQuery } from 'ufo'
import type { HeadersObject } from 'unenv/runtime/_internal/types'
import { localCall } from '../server'

export const handler = async function handler (event: APIGatewayProxyEvent | APIGatewayProxyEventV2, context: Context) {
  let url: string
  let method: string

  if ('path' in event) {
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
    headers: normalizeIncomingHeaders(event.headers),
    method,
    query: event.queryStringParameters,
    body: event.body // TODO: handle event.isBase64Encoded
  })

  return {
    statusCode: r.status,
    headers: normalizeOutgoingHeaders(r.headers),
    body: r.body.toString()
  }
}

function normalizeIncomingHeaders (headers: APIGatewayProxyEventHeaders) {
  return Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]))
}

function normalizeOutgoingHeaders (headers: HeadersObject) {
  return Object.fromEntries(Object.entries(headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v]))
}
