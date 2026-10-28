import React, { createContext, useContext, useState } from 'react'

interface KindeContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: {
    id: string
    given_name: string
    family_name: string
    email: string
    picture?: string
  } | null
  login: () => void
  logout: () => void
  getToken: () => Promise<string>
  register: () => void
}

const MockKindeContext = createContext<KindeContextType>({
  isAuthenticated: true,
  isLoading: false,
  user: {
    id: 'local_dev_user',
    given_name: 'Local',
    family_name: 'Developer',
    email: 'dev@example.com',
  },
  login: () => {},
  logout: () => {},
  getToken: async () => 'local_dev_token',
  register: () => {},
})

export const KindeProvider = ({ children }: { children: React.ReactNode }) => {
  const [authed, setAuthed] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('mock_auth') === 'true' || urlParams.get('dev') === 'true') {
        return true
      }
      return localStorage.getItem('kinde_auth_mock') === 'true'
    }
    return true
  })

  const login = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kinde_auth_mock', 'true')
    }
    setAuthed(true)
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kinde_auth_mock')
    }
    setAuthed(false)
  }

  return React.createElement(
    MockKindeContext.Provider,
    {
      value: {
        isAuthenticated: authed,
        isLoading: false,
        user: authed
          ? {
              id: 'local_dev_user',
              given_name: 'Local',
              family_name: 'Developer',
              email: 'dev@example.com',
            }
          : null,
        login,
        logout,
        getToken: async () => 'local_dev_token',
        register: login,
      },
    },
    children
  )
}

export const useKindeAuth = () => useContext(MockKindeContext)
