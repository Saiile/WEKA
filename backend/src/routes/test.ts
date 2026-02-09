import type { FastifyInstance } from 'fastify'
import { prisma } from '../prismaClient.js'
export async function testRoutes(server: FastifyInstance) {

  interface PostTestBody {
    message: string;
  }

  server.post<{ Body: PostTestBody }>('/postTest', async (request, reply) => {
    const { message } = request.body;
    return "Post worked -> " + message;
  })

}
