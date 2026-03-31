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

// Resources — M1
import ResourceListPage from './pages/resources/ResourceListPage'
import ResourceDetailPage from './pages/resources/ResourceDetailPage'
import ResourceFormPage from './pages/resources/ResourceFormPage'

// Bookings — M2
import BookingListPage from './pages/bookings/BookingListPage'
import BookingFormPage from './pages/bookings/BookingFormPage'
import BookingDetailPage from './pages/bookings/BookingDetailPage'
import AdminBookingQueuePage from './pages/bookings/AdminBookingQueuePage'

// Placeholders — filled in by M3
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

        {/* Resources — M1 */}
        <Route path="/resources" element={<ProtectedRoute><ResourceListPage /></ProtectedRoute>} />
        <Route path="/resources/:id" element={<ProtectedRoute><ResourceDetailPage /></ProtectedRoute>} />
        <Route path="/admin/resources/new" element={<ProtectedRoute requireAdmin><ResourceFormPage /></ProtectedRoute>} />
        <Route path="/admin/resources/:id/edit" element={<ProtectedRoute requireAdmin><ResourceFormPage /></ProtectedRoute>} />

        {/* Bookings — M2 */}
        <Route path="/bookings" element={<ProtectedRoute><BookingListPage /></ProtectedRoute>} />
        <Route path="/bookings/new" element={<ProtectedRoute><BookingFormPage /></ProtectedRoute>} />
        <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute requireAdmin><AdminBookingQueuePage /></ProtectedRoute>} />

        {/* Placeholder for M3 */}
        <Route path="/tickets/*"   element={<ProtectedRoute><Placeholder name="Tickets" /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requireAdmin><UserManagementPage /></ProtectedRoute>} />
      </Routes>
    </>
  )
}
