import { useKindeAuth as useRealKindeAuth } from '@kinde-oss/kinde-auth-react'
import { useKindeAuth as useMockKindeAuth } from './mockKinde'

const getIsMock = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK_AUTH === 'true') {
    return true
  }
  try {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location?.search || '')
      if (urlParams.get('mock_auth') === 'true') return true
      if (window.localStorage && window.localStorage.getItem('kinde_auth_mock') === 'true') return true
    }
  } catch {
    return false
  }
  return false
}

export const useKindeAuth = (...args: any[]) => {
  return getIsMock() ? (useMockKindeAuth as any)(...args) : (useRealKindeAuth as any)(...args)
}
