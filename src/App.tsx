import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import { RequireAdmin, RequireAuth } from './components/Guards'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import AdvisoriesPage from './pages/AdvisoriesPage'
import ReportPage from './pages/ReportPage'
import MyReportsPage from './pages/MyReportsPage'
import AuthPage from './pages/AuthPage'
import NotFoundPage from './pages/NotFoundPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminReports from './pages/admin/AdminReports'
import AdminAdvisories from './pages/admin/AdminAdvisories'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="advisories" element={<AdvisoriesPage />} />
            <Route path="login" element={<AuthPage mode="login" />} />
            <Route path="register" element={<AuthPage mode="register" />} />

            <Route element={<RequireAuth />}>
              <Route path="report" element={<ReportPage />} />
              <Route path="my-reports" element={<MyReportsPage />} />
            </Route>

            <Route element={<RequireAdmin />}>
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="advisories" element={<AdminAdvisories />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
