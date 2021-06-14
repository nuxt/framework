import unified from 'unified'
import matter from 'gray-matter'
import remarkParse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeRaw from 'rehype-raw'

export default async function transformMarkdown (input: string) {
  const markdown = unified()
    .use(remarkParse)
    .use(remark2rehype)
    .use(rehypeRaw)
    .use(rehypeStringify)

  // Parse front-matter
  const _matter = matter(input)

  // Transform Markdown to HTML
  const html = await markdown.process({ contents: _matter.content }).then(v => v.toString())

  return {
    body: { html },
    meta: _matter.data
  }
}
