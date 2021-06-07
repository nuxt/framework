# API Routes

Nuxt will automatically read in any files in the `~/server/api` directory to create API endpoints.

Each file should export a default function that handles a request. It can return a promise or JSON data directly. (See [h3 documentation](https://github.com/unjs/h3) for more details.)

```js
export default async (req, res) => {
  await someAsyncFunction()

  return {
    someData: true
  }
}
```
