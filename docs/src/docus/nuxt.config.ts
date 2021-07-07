import { readFileSync } from 'fs'
import { withDocus } from 'docus'
import { createAuthMiddleware } from 'ezpass'
import { Octokit } from '@octokit/rest'

const authEnabled = process.env.NODE_ENV === 'production'
if (authEnabled) {
  if (!process.env.GITHUB_CLIENT_ID) { throw new Error('Please define a GITHUB_CLIENT_ID in `.env` to add GitHub auth') }
  if (!process.env.GITHUB_CLIENT_SECRET) { throw new Error('Please define a GITHUB_CLIENT_SECRET in `.env` to add GitHub auth') }
  if (!process.env.GITHUB_TOKEN) { throw new Error('Please define a GITHUB_TOKEN in `.env` to add GitHub auth') }
  if (!process.env.SESSION_SECRET) { throw new Error('Please define a SESSION_SECRET in `.env` to add GitHub auth') }
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})
const forbiddenHtml = readFileSync('./forbidden.html', 'utf8')

export default withDocus({
  rootDir: __dirname,
  serverMiddleware: [
    createAuthMiddleware({
      bypass: !authEnabled,
      provider: 'github',
      providerOptions: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET
      },
      sessionSecret: process.env.SESSION_SECRET,
      onAuthorize: async (authRes) => {
        if (!authRes.authorized || !authRes.session) { return }
        await octokit.rest.repos.checkCollaborator({
          owner: 'nuxt',
          repo: 'beta',
          username: authRes.session.user
        }).then(() => {
          // console.log(authRes.session.user, 'has access to Nuxt 3 private beta')
        }).catch(() => {
          // console.warn(authRes.session.user, 'does not have access to Nuxt 3 private beta')
          authRes.authorized = false
          authRes.message = forbiddenHtml
          delete authRes.redirect
          delete authRes.session
        })
      }
    })
  ]
})
