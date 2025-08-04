
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
  userId?: string;
}

interface NavigationMetrics {
  path: string;
  loadTime: number;
  timestamp: number;
}

export const usePerformanceMonitoring = (componentName: string) => {
  const renderStartTime = useRef<number>(Date.now());
  const { user } = useAuth();

  useEffect(() => {
    const renderEndTime = Date.now();
    const renderTime = renderEndTime - renderStartTime.current;

    // Log performance metrics
    const metrics: PerformanceMetrics = {
      componentName,
      renderTime,
      timestamp: renderEndTime,
      userId: user?.id,
    };

    // Only log slow renders in development
    if (process.env.NODE_ENV === 'development' && renderTime > 100) {
      console.warn(`Slow render detected: ${componentName} took ${renderTime}ms`);
    }

    // Log to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      logPerformanceMetrics(metrics);
    }
  }, [componentName, user?.id]);

  const logNavigationTime = (path: string, loadTime: number) => {
    const metrics: NavigationMetrics = {
      path,
      loadTime,
      timestamp: Date.now(),
    };

    if (process.env.NODE_ENV === 'production') {
      logNavigationMetrics(metrics);
    }
  };

  return { logNavigationTime };
};

const logPerformanceMetrics = (metrics: PerformanceMetrics) => {
  // Implement analytics service integration
  console.log('Performance metrics:', metrics);
};

const logNavigationMetrics = (metrics: NavigationMetrics) => {
  // Implement analytics service integration
  console.log('Navigation metrics:', metrics);
};

export const useWebVitals = () => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metrics = {
          name: entry.name,
          value: entry.startTime,
          rating: entry.startTime < 100 ? 'good' : entry.startTime < 300 ? 'needs-improvement' : 'poor',
          timestamp: Date.now(),
        };

        if (process.env.NODE_ENV === 'production') {
          console.log('Web Vitals:', metrics);
        }
      }
    });

    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });

    return () => observer.disconnect();
  }, []);
};
