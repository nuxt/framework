import express from 'express'
import { ApolloServer, gql } from 'apollo-server-express'

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    users: [User!]
  }
  type User {
    id: ID!
    firstname: String
    lastname: String
    email: String
  }
`

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    users: () => [
      { id: 1, firstname: 'John', lastname: 'Smith', email: 'john@smith.com' },
      { id: 2, firstname: 'Lucy', lastname: 'Aronson', email: 'lucy@aronson.net' }
    ]
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  tracing: true,
  playground: {
    settings: {
      'editor.theme': 'light',
      'tracing.hideTracingResponse': false
    },
    tabs: [
      {
        name: 'Test',
        endpoint: '/api/graphql',
        query: 'query {\n  users \n}'
      }
    ]
  }
})

const app = express()

app.use(server.getMiddleware({ path: '/' }))

export default app
