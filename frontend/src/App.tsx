import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { ClaimDetailPage } from './pages/ClaimDetailPage';
import { FileClaimPage } from './pages/FileClaimPage';
import { BuyInsurancePage } from './pages/BuyInsurancePage';
import { ProfilePage } from './pages/ProfilePage';
import { DocumentsPage } from './pages/DocumentsPage';
import { HelpPage } from './pages/HelpPage';
import { PrivacyPage } from './pages/PrivacyPage';

import { ErrorBoundary } from './components/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary fallbackTitle="Application Error Encountered">
          <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />

          {/* Protected Customer Operational Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              }
            />
            <Route
              path="/claims"
              element={
                <DashboardLayout>
                  <ClaimsPage />
                </DashboardLayout>
              }
            />
            <Route
              path="/claims/new"
              element={
                <DashboardLayout>
                  <FileClaimPage />
                </DashboardLayout>
              }
            />
            <Route
              path="/claims/:id"
              element={
                <DashboardLayout>
                  <ClaimDetailPage />
                </DashboardLayout>
              }
            />
            <Route
              path="/buy-insurance"
              element={
                <DashboardLayout>
                  <BuyInsurancePage />
                </DashboardLayout>
              }
            />
            <Route
              path="/policies"
              element={
                <DashboardLayout>
                  <PoliciesPage />
                </DashboardLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <DashboardLayout>
                  <ProfilePage />
                </DashboardLayout>
              }
            />
            <Route
              path="/documents"
              element={
                <DashboardLayout>
                  <DocumentsPage />
                </DashboardLayout>
              }
            />
            <Route
              path="/help"
              element={
                <DashboardLayout>
                  <HelpPage />
                </DashboardLayout>
              }
            />
            <Route
              path="/privacy"
              element={
                <DashboardLayout>
                  <PrivacyPage />
                </DashboardLayout>
              }
            />
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
