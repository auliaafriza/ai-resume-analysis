"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface AppContextData {
  user: { name: string | null; email: string | null }
}

const AppContext = createContext<AppContextData | undefined>(undefined)

export function useAppContext(): AppContextData {
  const context = useContext(AppContext)
  if (!context) throw new Error("useAppContext must be used within AppProvider")
  return context
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user] = useState<AppContextData["user"]>({ name: null, email: null })

  return <AppContext.Provider value={{ user }}>{children}</AppContext.Provider>
}
