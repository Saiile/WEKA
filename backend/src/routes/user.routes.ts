import type { FastifyInstance } from 'fastify'
import { prisma } from '../prismaClient.js'
import { authenticate } from '../middlewares/authentificate.js'
import bcrypt from 'bcrypt';

interface User{
    id: number
    username: string
    password: string
    email: string
}

interface Credentials{
    username: string
    password: string
}

interface RegisterBody {
  email: string
  username: string
  password: string
}

interface UpdateMeBody {
  email?: string
  username?: string
  password?: string
}

export async function userRoutes(server: FastifyInstance) {

/*######################################   LOGIN   ######################################*/    


server.post<{ Body: Credentials }>('/login', async (request, reply) => {
  const { username, password } = request.body

  try {
    const user = await prisma.users.findFirst({
      where: { username },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
      },
    })

    if (!user) {
      return reply.code(401).send({ success: false, message: 'Wrong credentials' })
      
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return reply.code(401).send({ success: false, message: 'Wrong credentials' })
    }

    const token = server.jwt.sign({
      id: user.id,
      email: user.email,
      username: user.username,
    })

    return reply
      .setCookie('token', token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: false, 
      })
      .send({ success: true, message: 'Logged' })
  } catch (error) {
    return reply.code(500).send({ success: false, message: "Couldn't login" })
  }
});


    server.post('/logout', async (request, reply) => {
        reply.clearCookie('token', {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            secure: false
        })
    });

    server.get('/me', async (request, reply) => {
    try {
        await request.jwtVerify();
        const { id, username, email } = request.user as any;
        return { id, username, email };
    } catch (error) {
        return reply.code(401).send({ message: 'Invalid token' });
    }
});
/*######################################   REGISTER   ######################################*/    

 server.post<{ Body: RegisterBody }>('/register', async (request, reply) => {
        const { email, username, password } = request.body
    
        try {
          // check if already exist
          const existing = await prisma.users.findFirst({
            where: {
              OR: [{ email }, { username }],
            },
            select: { id: true },
          })
    
          if (existing) {
            return reply.code(409).send({ success: false, message: "User already exists" })
          }

    const passwordHash = await bcrypt.hash(password, 12)

    //create user
    const created = await prisma.users.create({
      data: { email, username, password: passwordHash },
      select: { id: true, email: true, username: true },
    })

    //send message to the frontend
    return reply.code(201).send({ success: true, message: 'Registered! you can now login', user: created })
  } catch (error: any) {


   
  }
})
    
/*######################################   DELETE ACCOUNT   ######################################*/ 

server.delete('/me', async (request, reply) => {
  try {
    await request.jwtVerify()
    const { id } = request.user as any

    await prisma.users.delete({ where: { id } })

    return reply
      .clearCookie('token', { httpOnly: true, path: '/', sameSite: 'lax', secure: false })
      .send({ success: true, message: 'Account deleted' })
  } catch (error) {
    console.error(error)
    return reply.code(401).send({ success: false, message: 'Unauthorized' })
  }
})

/*######################################    UPDATE ACCOUNT   ######################################*/ 

server.put<{ Body: UpdateMeBody }>('/me', async (request, reply) => {
  try {
    await request.jwtVerify()
    const { id } = request.user as any
const emailRaw = request.body.email
const usernameRaw = request.body.username
const passwordRaw = request.body.password

const email = emailRaw?.trim().toLowerCase()
const username = usernameRaw?.trim()
const password = passwordRaw?.trim()


if (!email || !username) {
  return reply.code(400).send({ success: false, message: 'Nothing to update' })
}



    // check if already exist but exclude the current user (ex: if I want juste update my email, it will check if the new email is not already used by another user, but it will exclude my own email in this check, so I can keep my email if I want, or change to a new one if the new one is not already used)
    if (email || username) {
      const existing = await prisma.users.findFirst({
        where: {
          AND: [
            { id: { not: id } }, // exclude current user
            {
              OR: [
                ...(email ? [{ email }] : []),
                ...(username ? [{ username }] : []),
              ],
            },
          ],
        },
        select: { id: true },
      })

      if (existing) {
        return reply.code(409).send({
          success: false,
          message: "Email or username already taken",
        })
      }
    }

    const dataToUpdate: any = {}
    if (email) dataToUpdate.email = email
    if (username) dataToUpdate.username = username
    if (password) dataToUpdate.password = await bcrypt.hash(password, 12)

    const updated = await prisma.users.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, email: true, username: true },
    })

    return reply.send({ success: true, message: "Profile updated", user: updated })
  } catch (error: any) {
    console.error(error)


  }
})

    server.get("/auth", async (request, reply) => {
        const auth = await authenticate(request, reply)
        return auth;
    })
}
