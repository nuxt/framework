import { provide } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'

import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'

const httpLink = createHttpLink({
  uri: 'http://localhost:3020/graphql'
})

const cache = new InMemoryCache()

const apolloClient = new ApolloClient({
  link: httpLink,
  cache
})

export function provideApollo () {
  provide(DefaultApolloClient, apolloClient)
}
