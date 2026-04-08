import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Navbar from './components/layout/Navbar'
import ErrorBoundary from './components/common/ErrorBoundary'
import './style.css'

// Auth
import LoginPage from './pages/auth/LoginPage'
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage'

// Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import UserManagementPage from './pages/admin/UserManagementPage'

// Dashboard
import StudentDashboardPage from './pages/dashboard/StudentDashboardPage'

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

// Incidents — M3
import IncidentListPage from './pages/incidents/IncidentListPage'
import IncidentFormPage from './pages/incidents/IncidentFormPage'
import IncidentDetailPage from './pages/incidents/IncidentDetailPage'
import AdminIncidentQueuePage from './pages/incidents/AdminIncidentQueuePage'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:    { main: '#b8c4ff', dark: '#1e40af' },
    error:      { main: '#ffb4ab' },
    background: { default: '#0b1326', paper: '#171f33' },
    text:       { primary: '#dae2fd', secondary: '#c4c5d5' },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { height: 36, paddingLeft: 16, paddingRight: 16, borderRadius: 8 },
        sizeLarge: { height: 44 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          border: '1px solid rgba(68,70,83,0.3)',
          backgroundImage: 'none',
          backgroundColor: '#171f33',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none', backgroundColor: '#171f33' },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#131b2e',
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: '#c4c5d5',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: '#131b2e' },
          '& .MuiTableCell-body': { borderBottom: '1px solid rgba(68,70,83,0.2)' },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: '12px 16px' },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiSelect: {
      defaultProps: { size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#131b2e',
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#b8c4ff',
            borderWidth: 2,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(68,70,83,0.5)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(184,196,255,0.4)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 9999, fontWeight: 500, fontSize: 11, letterSpacing: '0.04em' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 12, backgroundColor: '#171f33', backgroundImage: 'none' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(68,70,83,0.3)' },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: '#c4c5d5' },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: { backgroundColor: '#171f33' },
      },
    },
  },
})

export default function App() {
  return (
    <ErrorBoundary>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Auth routes — no navbar ──────────────────────────── */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/oauth-callback" element={<OAuthCallbackPage />} />

            {/* ── App routes — navbar rendered by MainLayout ────────── */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><StudentDashboardPage /></ProtectedRoute>} />
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

              {/* Incidents — M3 */}
              <Route path="/tickets" element={<ProtectedRoute><IncidentListPage /></ProtectedRoute>} />
              <Route path="/tickets/new" element={<ProtectedRoute><IncidentFormPage /></ProtectedRoute>} />
              <Route path="/tickets/:id" element={<ProtectedRoute><IncidentDetailPage /></ProtectedRoute>} />
              <Route path="/tickets/:id/edit" element={<ProtectedRoute><IncidentFormPage /></ProtectedRoute>} />
              <Route path="/admin/tickets" element={<ProtectedRoute requireAdminOrTechnician><AdminIncidentQueuePage /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboardPage /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requireAdmin><UserManagementPage /></ProtectedRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  )
}

function MainLayout() {
  return (
    <Navbar>
      <Outlet />
    </Navbar>
  )
}
