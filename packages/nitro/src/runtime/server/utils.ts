export function requestHasBody (request: Request) : boolean {
  return /post|put|patch/i.test(request.method)
}

export async function useRequestBody (request: Request): Promise<any> {
  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('form')) {
    const formData = await request.formData()
    const body = {}
    for (const entry of formData.entries()) {
      body[entry[0]] = entry[1]
    }
    return body
  } else if (contentType.includes('application/json')) {
    return request.json()
  } else if (/application\/text|text\/html/.test(contentType)) {
    return request.text()
  } else {
    const myBlob = await request.blob()
    const objectURL = URL.createObjectURL(myBlob)
    return objectURL
  }
}
