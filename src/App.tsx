
import { ProductionDiagnostics } from "@/components/ProductionDiagnostics";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AchievementEventProvider } from "@/contexts/AchievementEventContext";
import { SessionTrackingProvider } from "@/contexts/SessionTrackingContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import PasswordReset from "@/pages/PasswordReset";
import EmailVerify from "@/pages/EmailVerify";
import ProductionCheck from "@/pages/ProductionCheck";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import AppSettings from "@/pages/AppSettings";
import HelpSupport from "@/pages/HelpSupport";
import Legal from "@/pages/Legal";
import About from "@/pages/About";
import PrivacySettings from "@/pages/PrivacySettings";
import SubscriptionPage from "@/pages/SubscriptionPage";

import NotFound from "@/pages/NotFound";
import ErrorBoundary from "@/components/ErrorBoundary";
import { InstallPrompt } from "@/components/notifications/InstallPrompt";
import { DevToolsNotifications } from "@/components/DevToolsNotifications";
import ServiceWorkerMessageHandler from "@/components/notifications/ServiceWorkerMessageHandler";
import AdminAchievements from "@/pages/AdminAchievements";
import { Settings as SettingsIcon } from "lucide-react";
import { logger } from '@/utils/productionLogger';
import { PerformanceMonitor } from '@/utils/performanceOptimization';
import PrivacyConsentGate from "@/components/privacy/PrivacyConsentGate";

function App() {
  const [showDevTools, setShowDevTools] = useState(false);
  logger.debug('App: Rendering with authentication provider');
  
  // Initialize performance monitoring
  useEffect(() => {
    const perfMonitor = new PerformanceMonitor();
    perfMonitor.onMetricsReady((metrics) => {
      logger.debug('Performance metrics:', metrics);
    });
  }, []);
  
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="inner-fire-theme">
        <AuthProvider>
          <AchievementEventProvider>
            <SessionTrackingProvider>
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
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </>
            )}
            <PrivacyConsentGate>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/reset-password" element={<PasswordReset />} />
                <Route path="/auth/verify" element={<EmailVerify />} />
                <Route path="/verify-email" element={<EmailVerify />} />
                <Route path="/production-check" element={<ProductionCheck />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/profile" element={<Profile />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/settings/app-settings" element={<AppSettings />} />
                <Route path="/settings/subscription" element={<SubscriptionPage />} />
                <Route path="/settings/privacy-settings" element={<PrivacySettings />} />
                <Route path="/settings/help-support" element={<HelpSupport />} />
                <Route path="/settings/legal" element={<Legal />} />
                <Route path="/settings/about" element={<About />} />
                <Route path="/admin/achievements" element={<AdminAchievements />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PrivacyConsentGate>
            <Toaster />
            <SonnerToaster />
            <ProductionDiagnostics />
              </Router>
            </SessionTrackingProvider>
        </AchievementEventProvider>
      </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
