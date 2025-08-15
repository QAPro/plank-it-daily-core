
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Auth from '@/pages/Auth';
import EmailVerify from '@/pages/EmailVerify';
import ProductionCheck from '@/pages/ProductionCheck';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';

// Simple ProtectedRoute component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify-email" element={<EmailVerify />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } 
          />
          <Route path="/production-check" element={<ProductionCheck />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
