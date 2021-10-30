import { engines } from '../../package.json'

export async function checkEngines () {
  const satisfies = await import('semver/functions/satisfies').then(r => r.default)
  const currentNode = process.versions.node
  const nodeRange = engines.node

  if (!satisfies(process.versions.node, engines.node)) {
    console.warn(`Current version of Node.js (\`${currentNode}\`) is unsupported and might cause issues.\n       Please upgrade to a compatible version (${nodeRange}).`)
  }
}
