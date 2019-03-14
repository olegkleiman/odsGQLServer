import { ApolloServer } from 'apollo-server';
import { makeExecutableSchema } from 'graphql-tools';
import { OAuth2Client } from 'google-auth-library';

import typeDefs from '../schemas/schema.js';
import { resolvers } from './resolvers';
import { _elasticClient } from './utils';

const GOOGLE_CLIENT_ID = '1049230588636-gprtqumhag54a8g4nlpu7d8pje0vpmak.apps.googleusercontent.com';
const googleAuthclient = new OAuth2Client(GOOGLE_CLIENT_ID);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  context: async ({req}) => {

    const header = req.headers.authorization || '';
    const lexems = header.split(' ');
    if( lexems.length == 2 && lexems[1] ) {

      console.log(lexems[1]);

      try {
        const ticket = await googleAuthclient.verifyIdToken({
          idToken: lexems[1],
          audience: GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        console.log(payload);

        const user = await _elasticClient.findUser(payload.email);
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
