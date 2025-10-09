import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StripeProvider } from './contexts/StripeContext';
import { UserProvider } from './contexts/UserContext';
import DashboardLayout from './components/DashboardLayout';
import FreeDashboard from './pages/FreeDashboard';
import StarterDashboard from './pages/StarterDashboard';
import ProDashboard from './pages/ProDashboard';
import EnterpriseDashboard from './pages/EnterpriseDashboard';
import SuccessPage from './pages/SuccessPage';
import AISEOProtected from './components/AISEOProtected';
import './App.css';

function App() {
  return (
    <StripeProvider>
      <UserProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<Navigate to="/dashboard/free" replace />} />
              <Route path="/dashboard/free" element={
                <DashboardLayout plan="free">
                  <FreeDashboard />
                </DashboardLayout>
              } />
              <Route path="/dashboard/starter" element={
                <DashboardLayout plan="starter">
                  <StarterDashboard />
                </DashboardLayout>
              } />
              <Route path="/dashboard/pro" element={
                <DashboardLayout plan="pro">
                  <ProDashboard />
                </DashboardLayout>
              } />
              <Route path="/dashboard/pro/aiseo" element={
                <DashboardLayout plan="pro">
                  <AISEOProtected />
                </DashboardLayout>
              } />
              <Route path="/dashboard/enterprise" element={
                <DashboardLayout plan="enterprise">
                  <EnterpriseDashboard />
                </DashboardLayout>
              } />
              
              {/* Success/Cancel Pages */}
              <Route path="/dashboard/success" element={<SuccessPage />} />
              <Route path="/dashboard/cancel" element={<Navigate to="/dashboard" replace />} />
              
              {/* Legacy AI SEO route - redirects to new location */}
              <Route path="/ai-seo" element={<Navigate to="/dashboard/pro/aiseo" replace />} />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard/free" replace />} />
            </Routes>
          </div>
        </Router>
      </UserProvider>
    </StripeProvider>
  );
}

export default App;
