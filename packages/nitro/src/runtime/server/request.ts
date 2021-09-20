const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH']

export function useRequestBody (request: Request): Promise<void | string> {
  if (METHODS_WITH_BODY.includes(request.method.toUpperCase())) {
    return readRequestBody(request)
  }
}

export async function readRequestBody (request: Request): Promise<string> {
  const { headers } = request
  const contentType = headers.get('content-type') || ''

  if (contentType.includes('form')) {
    const formData = await request.formData()
    const body = {}
    for (const entry of formData.entries()) {
      body[entry[0]] = entry[1]
    }
    return JSON.stringify(body)
  } else if (contentType.includes('application/text') || contentType.includes('text/html') || contentType.includes('application/json')) {
    return request.text()
  } else {
    const myBlob = await request.blob()
    const objectURL = URL.createObjectURL(myBlob)
    return objectURL
  }
}
