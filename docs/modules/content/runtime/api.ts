import { useQuery } from 'h3'
import unified from 'unified'
import remarkParse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import rehypeDoc from 'rehype-document'
import rehypeStringify from 'rehype-stringify'
import rehypeRaw from 'rehype-raw'
import { readAsset } from '#assets'

export default async (req) => {
  const markdown = unified()
    .use(remarkParse)
    .use(remark2rehype)
    .use(rehypeRaw)
    .use(rehypeDoc)
    .use(rehypeStringify)

  const { slug, ext = 'md' } = useQuery(req)

  const data = await readAsset(`content${slug}.${ext}`) || `content not found: ${slug}.${ext}`

  if (ext === 'md') {
    return {
      html: await markdown.process({ contents: data }).then(v => v.toString())
    }
  }

  return data
}
