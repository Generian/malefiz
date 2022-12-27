import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { io, Socket } from "socket.io-client"
import { ChangeEvent, SetStateAction, useEffect, useState } from 'react'

export interface ServerToClientEvents {
  receiveInput: (msg: string) => void;
}

export interface ClientToServerEvents {
  sendInput: (msg: string) => void;
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> = io()

export default function Home() {
  const [input, setInput] = useState('')

  useEffect(() => {socketInitializer()}, [])

  const socketInitializer = async () => {
    await fetch('/api/socket')
    socket = io()

    socket.on('connect', () => {
      console.log('connected')
    })

    socket.on('receiveInput', msg => {
      setInput(msg)
    })
  }

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    console.log("new message")
    setInput(e.target.value)
    socket.emit('sendInput', e.target.value)
  }
  
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <input
          placeholder="Type something"
          value={input}
          onChange={onChangeHandler}
        />
      </main>
    </>
  )
}
