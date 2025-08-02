import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import SentTransactions from './pages/SentTransactions';
import ReceivedTransactions from './pages/ReceivedTransactions';
import DuplicateTransactions from './pages/DuplicateTransactions';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/wallets" element={
            <ProtectedRoute>
              <Layout>
                <Wallets />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/sent" element={
            <ProtectedRoute>
              <Layout>
                <SentTransactions />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/received" element={
            <ProtectedRoute>
              <Layout>
                <ReceivedTransactions />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/duplicates" element={
            <ProtectedRoute>
              <Layout>
                <DuplicateTransactions />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

