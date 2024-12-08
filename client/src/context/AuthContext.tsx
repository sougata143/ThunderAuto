import { createContext, useContext, useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN_USER, REGISTER_USER } from '../graphql/mutations'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const [loginMutation] = useMutation(LOGIN_USER)
  const [registerMutation] = useMutation(REGISTER_USER)

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: {
          input: { email, password }
        }
      })

      const { token: newToken, user: newUser } = data.login
      
      setToken(newToken)
      setUser(newUser)
      
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      const { data } = await registerMutation({
        variables: {
          input: { 
            firstName,
            lastName,
            email,
            password
          }
        }
      })

      const { token: newToken, user: newUser } = data.registerUser
      
      setToken(newToken)
      setUser(newUser)
      
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
