import { ApolloServer } from 'apollo-server';

import typeDefs from '../schemas/schema.js';
import { resolvers } from './resolvers';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true
});

server.listen().then(({ url }) => {
  console.log(`🚀 ODS GQL Server ready at ${url}`)
});
