import React from 'react'
import ReactDOM from 'react-dom/client'
import { KindeProvider as RealKindeProvider } from '@kinde-oss/kinde-auth-react'
import { KindeProvider as MockKindeProvider } from '@/shared/auth/mockKinde'
import App from './App'
import './index.css'

const isMock =
  import.meta.env.VITE_USE_MOCK_AUTH === 'true' ||
  !import.meta.env.VITE_KINDE_CLIENT_ID ||
  (typeof window !== 'undefined' &&
    (new URLSearchParams(window.location.search).get('mock_auth') === 'true' ||
      localStorage.getItem('kinde_auth_mock') === 'true'))
const Provider = isMock ? MockKindeProvider : RealKindeProvider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider
      clientId={import.meta.env.VITE_KINDE_CLIENT_ID || 'your_client_id'}
      domain={import.meta.env.VITE_KINDE_DOMAIN || 'https://your_domain.kinde.com'}
      redirectUri={import.meta.env.VITE_KINDE_REDIRECT_URI || 'http://localhost:3000'}
      logoutUri={import.meta.env.VITE_KINDE_LOGOUT_URI || 'http://localhost:3000'}
    >
      <App />
    </Provider>
  </React.StrictMode>,
)
