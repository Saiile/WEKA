# Weka

Weka is a **Discord-like web application** that allows users to create and join servers, organize conversations into channels, and work with **movable, multi-tab layouts** for a flexible UI experience.

<p align="center">
  <img src="screenshot.png" alt="Weka Screenshot" width="50%" />
</p>

## Features

* User authentication & registration
* Create and join servers
* Create channels inside servers
* Discord-inspired interface
* Real-time messaging with WebSocket
* Movable tabs on screen
* Modern full-stack architecture

<p align="center">
  <img src="frontend/app/assets/icon/emoji.png" alt="Weka Screenshot" width="300" />
</p>


## Tech Stack

Full Typescript stack

### Frontend

* **Nuxt.js**

### Backend

* **Fastify**
* **Prisma**
* **Supabase**
* **PostgreSQL**

## Project Structure

```bash
├── frontend/
│ ├── app/
│ │ ├── components/ # Vue components
│ │ ├── composables/ # Composables (useAuth, useChat, etc.)
│ │ ├── pages/ # Nuxt pages
│ │ └── types/ # Interface
│ └── public/ # Assets
├── backend/
│ ├── src/
│ │ ├── routes/ # API routes
│ │ ├── websocket/ # WebSocket
│ │ └── middlewares/ # Auth middleware
│ └── prisma/
│ └── schema.prisma # Database schema
└── README.MD
```

## API Endpoints

### Authentication

- `POST /signup` - Create a new user account
- `POST /login` - Authenticate user and get JWT token
- `POST /logout` - Invalidate JWT token
- `GET /me` - Get current user information

### Servers

- `POST /servers` - Create a new server
- `GET /servers` - List user's joined servers
- `GET /server/:id` - Get server details
- `PUT /servers/:id` - Update server
- `DELETE /servers/:id` - Delete server
- `POST /servers/:serverId/join` - Join a server
- `DELETE /servers/:id/leave` - Leave a server
- `GET /servers/:id/members` - List server members
- `PUT /servers/:id/members` - Update member role
- `GET /getAllServers` - List all available servers
- `GET /server/me` - Check if user owns a server

### Channels

- `POST /servers/:serverId/channels` - Create a channel
- `GET /servers/:serverId/channels` - List server channels
- `GET /channels/:id` - Get channel details
- `PUT /channels/:id` - Update channel
- `DELETE /channels/:id` - Delete channel

### Messages

- `POST /channels/:channelId/messages` - Send a message
- `GET /channels/:channelId/messages` - Get channel message history
- `DELETE /messages/:messageId` - Delete message


## Installation

Clone the repository:

```bash
git clone https://github.com/EpitechMscProPromo2028/T-JSF-600-MPL_8.git
cd T-JSF-600-MPL_8
```
### Database Setup / Prisma Migrations

Before running the backend, you need to set up the database:

```
cd backend
npx prisma db pull
npx prisma generate
```

This will create the necessary tables in your PostgreSQL database


### Install dependencies

You need to install dependencies in **both** the frontend and backend folders.

```bash
cd frontend
npm install
```

```bash
cd backend
npm install
```

## Development

### Run the frontend

```bash
cd frontend
npm run dev
```

### Run the backend

```bash
cd backend
npm run br
```

Make sure your Supabase environment variables are properly configured before starting the backend.

## Environment Variables

Create a `.env` file in the `backend` directory.

Example:
```
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

JWT_SECRET="secret_key"
```
## Roadmap

* Real-time messaging
* User authentication & profiles
* Permissions & roles
* Notifications
* UI/UX improvements