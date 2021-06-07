# Server Middleware

Nuxt will automatically read in any files in the `~/server/middleware` to create server middleware for your project. (These files will be run on every request, in contrast to [API routes](./api).)

Each file should export a default function that will handle a request.

```js
export default async (req, res) => {
  req.someValue = true
}
```
