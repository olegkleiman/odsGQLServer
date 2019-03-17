import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { OAuth2Client } from 'google-auth-library';
import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from '../schemas/schema.js';
import { resolvers } from './resolvers';
import { _elasticClient } from './utils';

const app = express();
app.use(cors('*'));

const GOOGLE_CLIENT_ID = '1049230588636-gprtqumhag54a8g4nlpu7d8pje0vpmak.apps.googleusercontent.com';
const googleAuthclient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use('/graphql', async (req, res, next) => {

  // TBD: better be handled by passport GoogleTokenStrategy
  // or even by Strategy of passport-jwt

  const header = req.headers.authorization || '';
  const lexems = header.split(' ');
  if( lexems.length == 2 && lexems[1] ) {

    try {
      // May cause 'Token used too late'
      const ticket = await googleAuthclient.verifyIdToken({
        idToken: lexems[1],
        audience: GOOGLE_CLIENT_ID
      });

      const _user = ticket.payload;
      const user = await _elasticClient.findUser(_user.email)
      req.user = user;

    } catch(err) {
      console.error(err);
    }
  }
  next()

})

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  context: ({req}) => {
    return req.user
  }
});

server.applyMiddleware({ app });

app.listen({ port: 4000 }, () => {
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
});
