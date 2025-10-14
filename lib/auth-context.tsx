"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type UserRole = "customer" | "driver" | "vendor" | "admin"

interface User {
  email: string
  role: UserRole
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user database
const users = [
  { email: "hamza@driver.com", password: "hdriver", role: "driver" as UserRole, name: "Hamza Driver" },
  { email: "hamza@vendor.com", password: "hvendor", role: "vendor" as UserRole, name: "Hamza Vendor" },
  { email: "hamza@customer.com", password: "hcustomer", role: "customer" as UserRole, name: "Hamza Customer" },
  { email: "hamza@admin.com", password: "hadmin", role: "admin" as UserRole, name: "Hamza Admin" },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = (email: string, password: string): boolean => {
    const foundUser = users.find((u) => u.email === email && u.password === password)
    if (foundUser) {
      const userData = { email: foundUser.email, role: foundUser.role, name: foundUser.name }
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))

      // Redirect based on role
      if (foundUser.role === "admin") {
        router.push("/admin")
      } else if (foundUser.role === "driver") {
        router.push("/driver")
      } else if (foundUser.role === "vendor") {
        router.push("/vendor")
      } else {
        router.push("/")
      }
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
