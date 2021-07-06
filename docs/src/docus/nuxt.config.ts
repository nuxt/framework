import { withDocus } from 'docus'
import { createAuthMiddleware } from 'ezpass'

export default withDocus({
  rootDir: __dirname,
  serverMiddleware: [
    createAuthMiddleware({
      // enabled: process.env.NODE_ENV === 'production',
      enabled: true,
      provider: 'github',
      providerOptions: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET
      },
      sessionSecret: process.env.SESSION_SECRET
    }),
    function (req, _res, next) {
      if (!req.auth) {
        return next()
      }
      // TODO: check if the user is listed as a collaborator
      console.log('req.auth.session.user', req.auth.session.user)
      next()
    }
  ]
})
