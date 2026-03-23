import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Navbar from './components/layout/Navbar'

// Auth
import LoginPage from './pages/auth/LoginPage'
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage'

// Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import UserManagementPage from './pages/admin/UserManagementPage'

// Notifications
import NotificationPage from './pages/notifications/NotificationPage'

// Placeholders — filled in by M1, M2, M3
const Placeholder = ({ name }: { name: string }) => <Box p={4}>{name} — coming soon</Box>

const theme = createTheme({
  palette: { primary: { main: '#1565c0' } },
})

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

function AppLayout() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth-callback" element={<OAuthCallbackPage />} />

        {/* Protected */}
        <Route path="/" element={<ProtectedRoute><Navigate to="/resources" replace /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />

        {/* Placeholders for other members */}
        <Route path="/resources/*" element={<ProtectedRoute><Placeholder name="Resources" /></ProtectedRoute>} />
        <Route path="/bookings/*"  element={<ProtectedRoute><Placeholder name="Bookings" /></ProtectedRoute>} />
        <Route path="/tickets/*"   element={<ProtectedRoute><Placeholder name="Tickets" /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requireAdmin><UserManagementPage /></ProtectedRoute>} />
      </Routes>
    </>
  )
}
