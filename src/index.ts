//const express, { Express, Request, Response, NextFunction } = require('express');
const express = require('express');
const { ApolloServer, gql, ApolloError } = require('apollo-server-express');
const bodyParser = require('body-parser');
import { ErrorCodes } from './errors/errorCodes';

import { UserTypes, isAuthorized } from './authorization/authorization'
// import { resolvers } from './graphql';  //TODO: use these when demo is ready
import { AuthMutations } from './authorization/resolvers'; //TODO: remove this when above is used
import { endPoolConnections } from './db/pgPool';
import { allBooksObject } from './books/resolvers' 

const typeDefs = gql`
  type AuthToken {
    token: String!
  }
 
  input AuthorizationTokenRequest {
    userName: String!
    password: String!
  }  

  type Book {
    title: String
    author: String
  }

  # remove below when we use real typedefs and resolvers
  type Mutation {
    generateUserAuthToken(authorizationTokenRequest: AuthorizationTokenRequest!): AuthToken!
    refreshToken: AuthToken!
  }

  type dbBook {
    bookId: Int
    bookTitle: String
    bookAuthor: String
    inStock: Boolean
  }

  type Query {
    books: [Book]
    dbBooks: [dbBook]
  }
`;

const books = [
    {
      title: 'Harry Potter and the Chamber of Secrets',
      author: 'J.K. Rowling',
    },
    {
      title: 'Jurassic Park',
      author: 'Michael Crichton',
    },
];

const dbBooks = allBooksObject();

const local = {
    Query: {
      books: () => books,
      dbBooks: () => dbBooks,
    },
    Mutation: {
      ...AuthMutations,
    }
};

const createUserContext = req => {
  const authHeaderValue = req.headers.authorization;
  if (authHeaderValue) {
    const authHeaderValueParts = authHeaderValue.split(' ');

    if (authHeaderValueParts.length !== 2) {
      console.error(`Invalid authHeaderValueParts: ${authHeaderValue}`);
      throw new ApolloError('Invalid authorization header provided', ErrorCodes.InternalError);
    }

    const bearerName = authHeaderValueParts[0].trim();
    const bearerValue = authHeaderValueParts[1].trim();

    return isAuthorized(bearerValue);
  }
  return { type: UserTypes.Anonymous };
}

const server = new ApolloServer({
  typeDefs,
  resolvers: local,
  introspection: true,
  playground: true,
  debug: true,
  //context: ({ req }) => ({ userContext: createUserContext(req) }),
});

const app = express();

app.use(
  '/graphql',
  bodyParser.json(),
  bodyParser.text({ type: 'application/graphql' }),
  (req, _res, next) => {
    //TODO: config-ify below 
    // console.log(`req.body: ${JSON.stringify(req.body)}`);
    if (req.is('application/graphql')) {
      req.body = { query: req.body };
    }
    next();
  }
);

server.applyMiddleware({ app });

const daemon = app.listen({ port: 8089 }, () =>
  console.log(`--> Server ready at http://localhost:${8089}${server.graphqlPath}`)
);

let connections: any = [];
daemon.on('connection', connection => {
  connections.push(connection);
  connection.on('close', () => {
    connections = connections.filter((curr: any) => curr !== connection);
    return 0;
  });
});

const shutDown = () => {
  console.log('Received kill signal, shutting down gracefully');
  endPoolConnections();
  daemon.close(() => {
    console.log('Closed out remaining connections');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);

  connections.forEach((curr: any) => curr.end());
  setTimeout(() => connections.forEach((curr: any) => curr.destroy()), 5000);
};

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
