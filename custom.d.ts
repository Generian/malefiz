import { Server as IOServer } from "socket.io"
import { Games } from "./types" // Import or define the Games interface

declare module "http" {
  interface Server {
    io?: IOServer // Add the Socket.IO server to the Node.js Server type
    users?: Users
    games?: Games // Add the games object to the server
    botExecutor?: BotExecutor
  }
}

declare module "net" {
  interface Socket {
    server: Server // Extend the Socket type to include the modified Server
  }
}
