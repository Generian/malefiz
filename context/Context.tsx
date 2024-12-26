import { ReactNode } from "react"
import { DataProvider } from "./DataContext"
import { SocketProvider } from "./SocketContext"

interface ContextProps {
  children: ReactNode
}

export default function Context({ children }: ContextProps) {
  return (
    <>
      <DataProvider>
        <SocketProvider>{children}</SocketProvider>
      </DataProvider>
    </>
  )
}
