# @nuxt/content

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![license][license-src]][license-href]

Data storage layer for Nuxt.
## Why?

- Import data from any sources
- Powerful query layer
- Versatile: swap any CMS without changing your code
- First class support for filesystem

## Setup

Install `@nuxt/content` as `devDependency` of project:

```sh
yarn add --dev @nuxt/content
# or
npm i -D @nuxt/content
```

Add `@nuxt/content` to `buildModules` in `nuxt.config`:

```js
// nuxt.config
export default {
  buildModules: [
    '@nuxt/content'
  ]
}
```

## Usage

### Use data/ directory

Let's imagine a structure like the following:

```bash
content/
  blog/
    2021.md
    2020.md
  authors/
    pi0.md
    atinux.md
    danielroe.md
  settings.json
```

`@nuxt/content` will automatically read the `content/` directory and offer a powerful query layer.

To fetch the `settings.json`, simply use:

```ts
const settings = await this.$content('setting.json')

const authors = await this.$content.findAll('authors')
const authors = await this.$content.findOne('settings')

// Surround:
const authors = await this.$content.findAll('authors', { where: { age: '>28' } })
const authors = await this.$content.findAround('authors', { where: { age: '>28' } })
// findAll('', { only: ['slug'], skip: indexOfX - 10, limit: 10 })

// with composition API
const { list, get, surround, search } = useContent()
const { content: settings, pending, error } = get('setting.json', { only: ['title'] })
const { content: settings, pending, error } = list('docs', { where: { draft: false } })
// Alternative
const { findOne, findAll, search, surround } = useContent()
const { content: settings, pending, error } = findOne('setting.json', { only: ['title'] })

// 1. Get by slug
// 2. Get all keys + meta [caching p1/p2] cache as index
// 3. (query api) [indexing p2/p1]


API:
/fetch(id) [done] [meta only]
/search(ns) [todo]
```

Current @nuxt/content is merging metadata and file body.

Ex:

```json [content/hello.json]
{
  "hello": "world"
}
```

It will return

```json
{
  "hello": "world",
  // metadata [based on storage]
  "path": "hello.json",
  "key": "hello",
  "createdAt": "..."
  // metadata [extracted out of transform]
  "md.title": "..."
}
```

```js
$content.find('blog').where({ 'frontmatter.date': { $gte: '2020-01-01' } })
```

Current @nuxt/content:
1. Read content/ dir
2. Transform each file to JSON
3. Store in LokiJS

Dev:

1. Query KV for all keys in `blog:` namespace
2. Fetch all KV-native meta for keys
3. [if query needs parsed meta] Fetch all contents and transform them to extract additional meta
4. Apply meta filters
5. Fetch contents
6. Transform

Watcher: file X changed: invalidate X transform cache

Index creation:

- Fetch all keys and content
- Apply transforms
- Collect indexes
- Store index
- [Invalidation?]

Map: namespace to array of meta and store

## 📑 License

[MIT License](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://flat.badgen.net/npm/v/@nuxt/content
[npm-version-href]: https://npmjs.com/package/@nuxt/content
[npm-downloads-src]: https://flat.badgen.net/npm/dm/@nuxt/content
[npm-downloads-href]: https://npmjs.com/package/@nuxt/content
[license-src]: https://flat.badgen.net/github/license/nuxt/data
[license-href]: https://npmjs.com/package/@nuxt/content



```bash
content/
  .src/ # not parsed
  _videos/ # not parsed?
    vueschool.yml
    masteringnuxt.yml
  settings.json

Keys:
videos/vueschool.yml (ignored as a page)
...

```

$content.findAll('_videos', { only: ['metadata'] })
