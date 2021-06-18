import { DefaultApolloClient } from '@vue/apollo-composable/dist'

import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'

export default ({ app }) => {
  const httpLink = createHttpLink({
    uri: '/api/graphql'
  })
  const cache = new InMemoryCache()
  const apolloClient = new ApolloClient({
    link: httpLink,
    cache
  })
  // https://v3.vuejs.org/api/application-api.html#provide
  app.provide(DefaultApolloClient, apolloClient)
}
