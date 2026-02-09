import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie'

import { serverRoute } from './routes/server.routes.js'
import { testRoutes } from './routes/test.js'
import { servermembersRoute } from './routes/servermembers.routes.js'
import { userRoutes } from './routes/user.routes.js';
import { messageRoutes } from './routes/messages.routes.js';
import WebSocket from '@fastify/websocket';
import { chatWebSocket} from './websocket/ws.js';
import { channelRoute } from './routes/channels.routes.js';

 declare global {
  interface BigInt {
    toJSON(): number
  }
};

BigInt.prototype.toJSON = function() {
  return Number(this)
};

const server = fastify();

server.register(cookie)
server.register(jwt, {
  secret: process.env.JWT_SECRET || 'super-secret-key',
  cookie: { cookieName: 'token', signed: false }
})

await server.register(cors, {
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});


server.register(testRoutes);
server.register(messageRoutes)

server.register(serverRoute);
server.register(servermembersRoute);
server.register(userRoutes);
server.register(channelRoute)

await server.register(WebSocket)
await chatWebSocket(server)

server.listen({ port: 8080, host: 'localhost' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
});
