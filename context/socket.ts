import { io, Socket } from "socket.io-client"

const isBrowser = typeof window !== "undefined"

export const socket = (isBrowser ? io() : {}) as Socket
