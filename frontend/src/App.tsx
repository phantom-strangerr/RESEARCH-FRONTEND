import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LivePacketsPage } from './pages/LivePacketsPage';
import { SystemHealthPage } from './pages/SystemHealthPage';
import { LogsPage } from './pages/LogsPage';
import { AlertsPage } from './pages/AlertsPage';
import { PortsPage } from './pages/PortsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { DevicesPage, MetricsPage, ForensicsPage } from './pages/PlaceholderPages';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/system-health" element={<SystemHealthPage />} />
                      <Route path="/packets" element={<LivePacketsPage />} />
                      <Route path="/alerts" element={<AlertsPage />} />
                      <Route path="/ports" element={<PortsPage />} />
                      <Route path="/logs" element={<LogsPage />} />
                      <Route path="/forensics" element={<ForensicsPage />} />
                      
                      {/* Admin-only Routes */}
                      <Route
                        path="/users"
                        element={
                          <ProtectedRoute requiredRoles={['super_admin']}>
                            <UserManagementPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Legacy route redirects */}
                      <Route path="/devices" element={<Navigate to="/system-health" replace />} />
                      <Route path="/metrics" element={<Navigate to="/ports" replace />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
