
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import EmailVerify from "@/pages/EmailVerify";
import ProductionCheck from "@/pages/ProductionCheck";
import NotFound from "@/pages/NotFound";
import ErrorBoundary from "@/components/ErrorBoundary";
import { InstallPrompt } from "@/components/notifications/InstallPrompt";
import { DevToolsNotifications } from "@/components/DevToolsNotifications";
import ServiceWorkerMessageHandler from "@/components/notifications/ServiceWorkerMessageHandler";
import { Settings } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const [showDevTools, setShowDevTools] = useState(false);
  console.log('App: Rendering with authentication provider');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <ServiceWorkerMessageHandler />
            <InstallPrompt />
            {process.env.NODE_ENV === 'development' && (
              <>
                {showDevTools && (
                  <div className="fixed bottom-4 left-4 z-50">
                    <DevToolsNotifications onClose={() => setShowDevTools(false)} />
                  </div>
                )}
                <Button
                  onClick={() => setShowDevTools(true)}
                  size="sm"
                  variant="outline"
                  className="fixed bottom-4 right-4 z-40 h-10 w-10 p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </>
            )}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/verify" element={<EmailVerify />} />
              <Route path="/verify-email" element={<EmailVerify />} />
              <Route path="/production-check" element={<ProductionCheck />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
