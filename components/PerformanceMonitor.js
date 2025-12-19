'use client';

import { useEffect } from 'react';

const PerformanceMonitor = () => {

  useEffect(() => {
    // Web Vitals monitoring
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor Core Web Vitals
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS((metric) => {
          console.log('CLS:', metric);
          // Send to analytics
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              name: metric.name,
              value: metric.value,
              event_category: 'Web Vitals',
            });
          }
        });

        getFID((metric) => {
          console.log('FID:', metric);
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              name: metric.name,
              value: metric.value,
              event_category: 'Web Vitals',
            });
          }
        });

        getFCP((metric) => {
          console.log('FCP:', metric);
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              name: metric.name,
              value: metric.value,
              event_category: 'Web Vitals',
            });
          }
        });

        getLCP((metric) => {
          console.log('LCP:', metric);
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              name: metric.name,
              value: metric.value,
              event_category: 'Web Vitals',
            });
          }
        });

        getTTFB((metric) => {
          console.log('TTFB:', metric);
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              name: metric.name,
              value: metric.value,
              event_category: 'Web Vitals',
            });
          }
        });
      }).catch(err => console.log('Web Vitals failed to load:', err));
    }
  }, []);

  return null;
};

export default PerformanceMonitor;
