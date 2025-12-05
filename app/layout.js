
import { Inter } from 'next/font/google';
import "./globals.css";
import AppLayout from "@/components/AppLayout";
import Footer from "@/components/Footer";
import SessionWrapper from "@/components/SessionWrapper";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import GoogleOneTap from "@/components/GoogleOneTap";
import FloatingCreatorChecklist from "@/components/FloatingCreatorChecklist";
import { Analytics } from "@vercel/analytics/next";
import { UserProvider } from "@/context/UserContext";
// Initialize FamPoints expiry system
import "@/utils/initializeExpiry";

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  metadataBase: new URL('https://www.sygil.app'),
  title: {
    default: 'Sygil - Connect with Your Favorite Creators',
    template: '%s | Sygil'
  },
  description: 'Join Sygil to connect with creators, earn points, unlock exclusive content, and support your favorite influencers through donations and premium perks. The ultimate creator-fan platform.',
  keywords: [
    'creators', 'influencers', 'exclusive content', 'fan community', 
    'creator support', 'social platform', 'content creators', 'fan engagement',
    'creator economy', 'monetization', 'vault items', 'creator dashboard',
    'fan points', 'donations', 'premium content', 'influencer marketing'
  ],
  authors: [{ name: 'Sygil Team', url: 'https://www.sygil.app' }],
  creator: 'Sygil',
  publisher: 'Sygil',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'Social Network',
  classification: 'Creator Platform',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.sygil.app',
    siteName: 'Sygil',
    title: 'Sygil - Connect with Your Favorite Creators',
    description: 'Join thousands of fans connecting with their favorite creators. Earn points, unlock exclusive content, and support creators through donations and premium perks.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sygil - Creator Community Platform',
        type: 'image/jpeg',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sygil - Connect with Your Favorite Creators',
    description: 'Join thousands of fans connecting with their favorite creators. Earn points, unlock exclusive content, and support creators.',
    creator: '@sygil_official',
    site: '@sygil_official',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#FF1B6B' },
    ],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
    other: {
      'msvalidate.01': process.env.BING_VERIFICATION,
    },
  },
  alternates: {
    canonical: 'https://www.sygil.app',
  },
  other: {
    'application-name': 'Sygil',
    'apple-mobile-web-app-title': 'Sygil',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#FF1B6B',
    'theme-color': '#FF1B6B',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://vercel.live" />
        <link rel="preconnect" href="https://accounts.google.com" />
        
        {/* Preconnect to image CDNs and external services */}
        <link rel="preconnect" href="https://picsum.photos" />
        <link rel="preconnect" href="https://api.dicebear.com" />
        <link rel="preconnect" href="https://cdn.simpleicons.org" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://www.paypal.com" />
        
        {/* Google Identity Services */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        <script src="https://apis.google.com/js/api.js" async defer></script>
        
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-7JF29P11H7"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-7JF29P11H7');
            `,
          }}
        />
        
        {/* JSON-LD Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Sygil",
              "url": "https://www.sygil.app",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.sygil.app/logo.png",
                "width": 512,
                "height": 512
              },
              "description": "The ultimate platform connecting creators with their fans through exclusive content, points, and donations.",
              "sameAs": [
                "https://instagram.com/_sygil_official",
                "https://twitter.com/sygil_official"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://www.sygil.app/contact",
                "availableLanguage": "English"
              },
              "foundingDate": "2024",
              "slogan": "Connect with Your Favorite Creators",
              "numberOfEmployees": "1-10",
              "industry": "Social Media Platform",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "US"
              }
            })
          }}
        />

        {/* WebApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Sygil",
              "url": "https://www.sygil.app",
              "description": "Connect with creators, earn points, unlock exclusive content",
              "applicationCategory": "SocialNetworkingApplication",
              "operatingSystem": "Web Browser",
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
              "permissions": "Read user profile, manage user content",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "category": "Free"
              },
              "featureList": [
                "Creator profiles",
                "Fan points system", 
                "Exclusive content access",
                "Creator donations",
                "Content vault",
                "Creator dashboard"
              ]
            })
          }}
        />
      </head>
      <body className="antialiased">
        <SessionWrapper>  
          <UserProvider>
            <PerformanceMonitor />
            <GoogleOneTap />
            <FloatingCreatorChecklist />
            <AppLayout>
              <main role="main">
                {children}
              </main>
            </AppLayout>
            <Footer />
          </UserProvider>
          <Analytics />
        </SessionWrapper> 
      </body>
    </html>
  );
}
