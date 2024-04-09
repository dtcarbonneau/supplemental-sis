import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginLandingPageProductionDefault } from '@apollo/server/plugin/landingPage/default'
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import http from 'http';
import cors from 'cors';
import pkg from 'body-parser';
import { typeDefs } from './typeDefs.js';
import { resolvers } from './resolvers.js';
import 'dotenv/config';
import { getGoogleOAuthURL, userInfoHandler, googleOauthHandler, getToken } from './AuthController.js'
//imports below give us webpack compiler that generates our index.html in dev mode
//import {webpackDevMiddlewareComp, webpackHotMiddlewareComp} from './dev.js'

const { json } = pkg;

import 'dotenv/config';
//dev is boolean that is true if NODE_ENV is not eqal to production.
const dev = process.env.NODE_ENV !== "production";
import path from 'path';
import { fileURLToPath } from 'url';

//create express server using Apollo Server middleware
const app = express();
const httpServer = http.createServer(app);
let plugins = [];
if (process.env.NODE_ENV === "production") {
    plugins = [ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageProductionDefault({
        embed: true,
        graphRef: "myGraph@prod",
        includeCookies: true,
      }),
    ];
  } else {
    plugins = [ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({
        embed: true,
        includeCookies: true,
      }),
    ];
  }
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: plugins,
});
await server.start();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//middlewares
//serve static index.html file in production mode

//generate index.html in development mode bundle stays in RAM
if (dev) {
  //use dynamic imports so don't start webpack middleware unless needed
  const { webpackDevMiddlewareComp } = await import('./dev.js')
  const {webpackHotMiddlewareComp} = await import ('./dev.js')
  app.use(webpackDevMiddlewareComp).use(webpackHotMiddlewareComp);
}
else
  app.use(express.static(path.join(__dirname, "client", "dist")));

app.use(cors(), json(), cookieParser())
app.use(helmet());

app.use(
  '/graphql',
  expressMiddleware(server, {
    context: async ({ req, res }) => ({
      token: await getToken(req, res),
    }),
  }),
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

app.get("/user",(req,res) => userInfoHandler(req, res))
app.get("/login",(req, res)=> res.redirect(getGoogleOAuthURL()))
app.get("/api/auth/callback/google", (req,res)=>googleOauthHandler(req,res))
//app.get("/authToken", (req, res) => authTokenHandler(req, res))
app.get("/getClasses", (req, res) => getToken(req, res))

await new Promise((resolve) => httpServer.listen({ port: 3000 }, resolve));

console.log(`🚀 Server ready at http://localhost:3000/graphql`);
