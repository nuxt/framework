
export async function invoke (args) {
  const { loadNuxt, buildNuxt } = await import('@nuxt/kit')

  const nuxt = await loadNuxt({ rootDir: args._[0] })
  await buildNuxt(nuxt)
}

export const meta = {
  usage: 'nu build [rootDir]',
  description: 'Build nuxt for production deployment'
}
