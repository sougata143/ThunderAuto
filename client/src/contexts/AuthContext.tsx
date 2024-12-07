import React, { createContext, useContext, useState, useEffect } from 'react'
import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import { GET_ME, LOGIN, REGISTER, CREATE_GUEST_USER } from '../graphql/queries'

interface User {
  id: string
  name: string
  email: string
  role: string
  isGuest: boolean
  preferences: {
    theme: string
    notifications: boolean
    language: string
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: Error | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  loginAsGuest: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const client = useApolloClient()
  const { loading: userLoading } = useQuery(GET_ME, {
    skip: !token,
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me)
      }
    },
    onError: () => {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    },
  })

  const [loginMutation] = useMutation(LOGIN)
  const [registerMutation] = useMutation(REGISTER)
  const [createGuestUserMutation] = useMutation(CREATE_GUEST_USER)

  useEffect(() => {
    setLoading(userLoading)
  }, [userLoading])

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: { input: { email, password } },
      })
      const { token: newToken, user: newUser } = data.login
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(newUser)
      setError(null)
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data } = await registerMutation({
        variables: { input: { name, email, password } },
      })
      const { token: newToken, user: newUser } = data.register
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(newUser)
      setError(null)
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const loginAsGuest = async () => {
    try {
      const { data } = await createGuestUserMutation()
      const { token: newToken, user: newUser } = data.createGuestUser
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(newUser)
      setError(null)
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    client.resetStore()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        token,
        isAuthenticated: !!user,
        login,
        register,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
