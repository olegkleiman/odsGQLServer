import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { OAuth2Client } from 'google-auth-library';
import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from '../schemas/schema.js';
import { resolvers } from './resolvers';
import { _elasticClient } from './utils';

const keys = require('./tlvods.keys.json');

const app = express();
app.use(cors('*'));

const googleAuthclient = new OAuth2Client(keys.web.client_id,
                                          keys.web.client_secret,
                                          keys.web.redirect_uris);

app.get('/auth/google/callback', (req, res) => {
  console.log(req);
})

app.use('/x', async (req, res, next) => {

  const code = req.headers['x-code'];

  try {

    const resp = await googleAuthclient.getToken(code);
    const tokens = resp.tokens;
    googleAuthclient.setCredentials(resp);

    res.setHeader('Content-Type', 'application/json');
    const jsonToken = {
      id_token: tokens.id_token
    }
    res.send(JSON.stringify(jsonToken));
  } catch( err ) {
    console.error(err)
    res.send(500);
  }

})

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
        audience: keys.web.client_id
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
