'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const PerformanceMonitor = () => {
  const pathname = usePathname();

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

    // Google Analytics 4 (replace with your actual GA4 ID)
    const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX';
    
    if (GA_TRACKING_ID && GA_TRACKING_ID !== 'G-XXXXXXXXXX' && typeof window !== 'undefined') {
      // Load GA4 if not already loaded
      if (!window.gtag) {
        const script1 = document.createElement('script');
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
        script1.async = true;
        document.head.appendChild(script1);

        const script2 = document.createElement('script');
        script2.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `;
        document.head.appendChild(script2);
      }
    }
  }, []);

  // Track page views
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
};

export default PerformanceMonitor;
