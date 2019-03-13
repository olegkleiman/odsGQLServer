import { ApolloServer } from 'apollo-server';
import { makeExecutableSchema } from 'graphql-tools';
import jwt_decode from 'jwt-decode';

import typeDefs from '../schemas/schema.js';
import { resolvers } from './resolvers';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  context: ({req}) => {

    const header = req.headers.authorization || '';
    const lexems = header.split(' ');
    if( lexems.length == 2 && lexems[1] ) {

      try {
        const user = jwt_decode(lexems[1]);
        console.log(user);

        return {user};
      } catch( err ) {
        console.log(err);
      }
    }

  }
});

server.listen().then(({ url }) => {
  console.log(`🚀 ODS GQL Server ready at ${url}`)
});
