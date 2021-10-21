import path from 'pathe'
import { extendPreset, writeFile } from '../utils'
import { NitroPreset, NitroContext } from '../context'
import { node } from './node'
import globby from 'globby'
import fs from 'fs-extra'

export const vercel: NitroPreset = extendPreset(node, {
  entry: '{{ _internal.runtimeDir }}/entries/vercel',
  output: {
    dir: '{{ _nuxt.rootDir }}/.output',
    serverDir: '{{ output.dir }}/nuxt-server',
    publicDir: '{{ output.dir }}/static'
  },
  ignore: [
    'vercel.json'
  ],
  hooks: {
    async 'nitro:compiled' (ctx: NitroContext) {
      await createServerlessFunction(ctx);
      await writeRoutes(ctx)
    }
  }
})

async function createServerlessFunction (ctx: NitroContext) {
  const { output, _nuxt: { rootDir } } = ctx;

  const pageEntryPoint = path.join(output.dir, 'server', 'pages', 'index.mjs')
  const nftFile = `${pageEntryPoint}.nft.json`;

  // Should be `.output`, but taken from `output` for tests
  const outputDirName = output.dir.split('/').slice(-1)[0];
  const mountDir = path.join(outputDirName, 'server', 'pages')

  await fs.ensureDir(path.join(output.dir, 'server', 'pages'))
  await fs.rename(path.join(output.serverDir, 'index.mjs'), pageEntryPoint)

  const includedFiles = await globby('**', { cwd: output.serverDir })

  const nftContent = {
    version: 1,
    files: includedFiles.map(relPath => {
      return {
        input: path.relative(
          path.join(rootDir, mountDir),
          path.join(output.serverDir, relPath)
        ),
        output: relPath
      }
    })
  }
  await writeFile(nftFile, JSON.stringify(nftContent, null, 2));
}

async function writeRoutes ({ output }: NitroContext) {
  const routesManifest = {
    version: 3,
    headers: [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'cache-control',
            value: 'public, max-age=0, must-revalidate'
          }
        ],
        regex: '^/sw.js'
      },
      {
        source: '/_nuxt/(.*)',
        headers: [
          {
            key: 'cache-control',
            value: 'public,max-age=31536000,immutable'
          }
        ],
        regex: '^/_nuxt/(.*)',
      }
    ],
    rewrites: [
      {
        source: '(.*)',
        destination: '/server/index',
        regex: '^(.*)$'
      }
    ]
  };

  await writeFile(path.resolve(output.dir, 'routes-manifest.json'), JSON.stringify(routesManifest, null, 2))
}
