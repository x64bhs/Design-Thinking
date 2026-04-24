import { Navigate, Route, Routes } from 'react-router-dom'

import { AuthPage } from '@/pages/auth-page'
import { HomePage } from '@/pages/home-page'
import { AppPage } from '@/pages/app-page'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/app" element={<AppPage />} />
      <Route path="/signin" element={<AuthPage mode="signin" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
