import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

export interface PerformanceMetrics {
  cls: number;
  inp: number;
  fcp: number;
  lcp: number;
  ttfb: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private callbacks: ((metrics: PerformanceMetrics) => void)[] = [];

  constructor() {
    this.initializeWebVitals();
  }

  private initializeWebVitals() {
    // Cumulative Layout Shift
    onCLS((metric: Metric) => {
      this.metrics.cls = metric.value;
      this.checkCompletion();
    });

    // Interaction to Next Paint (replaces FID)
    onINP((metric: Metric) => {
      this.metrics.inp = metric.value;
      this.checkCompletion();
    });

    // First Contentful Paint
    onFCP((metric: Metric) => {
      this.metrics.fcp = metric.value;
      this.checkCompletion();
    });

    // Largest Contentful Paint
    onLCP((metric: Metric) => {
      this.metrics.lcp = metric.value;
      this.checkCompletion();
    });

    // Time to First Byte
    onTTFB((metric: Metric) => {
      this.metrics.ttfb = metric.value;
      this.checkCompletion();
    });
  }

  private checkCompletion() {
    const requiredMetrics = ['cls', 'fcp', 'lcp', 'ttfb'] as const;
    const hasAllMetrics = requiredMetrics.every(metric => 
      this.metrics[metric] !== undefined
    );

    if (hasAllMetrics) {
      const completeMetrics: PerformanceMetrics = {
        cls: this.metrics.cls!,
        inp: this.metrics.inp || 0,
        fcp: this.metrics.fcp!,
        lcp: this.metrics.lcp!,
        ttfb: this.metrics.ttfb!,
        timestamp: Date.now()
      };

      this.callbacks.forEach(callback => callback(completeMetrics));
    }
  }

  onMetricsReady(callback: (metrics: PerformanceMetrics) => void) {
    this.callbacks.push(callback);
  }

  getLoadPerformance() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return null;

    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      loadComplete: navigation.loadEventEnd - navigation.fetchStart,
      firstByte: navigation.responseStart - navigation.fetchStart,
      domInteractive: navigation.domInteractive - navigation.fetchStart,
    };
  }
}

// Progressive loading utilities
export const deferNonCriticalOperations = (operations: Array<() => Promise<void>>) => {
  // Wait for next idle period or after 100ms
  const runOperations = () => {
    operations.forEach(async (operation) => {
      try {
        await operation();
      } catch (error) {
        console.warn('Deferred operation failed:', error);
      }
    });
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(runOperations, { timeout: 100 });
  } else {
    setTimeout(runOperations, 100);
  }
};

// Service worker optimization
export const deferServiceWorkerRegistration = () => {
  if (!('serviceWorker' in navigator)) return;

  const registerSW = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw-secure.js', {
        scope: '/'
      });
      console.log('[SW] Service worker registered (deferred):', registration.scope);
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW] New service worker available');
            }
          });
        }
      });
    } catch (error) {
      console.error('[SW] Deferred service worker registration failed:', error);
    }
  };

  // Defer service worker registration
  if ('requestIdleCallback' in window) {
    requestIdleCallback(registerSW, { timeout: 2000 });
  } else {
    setTimeout(registerSW, 2000);
  }
};