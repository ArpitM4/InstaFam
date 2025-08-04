
import { Inter } from 'next/font/google';
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionWrapper from "@/components/SessionWrapper";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import GoogleOneTap from "@/components/GoogleOneTap";
import FloatingCreatorChecklist from "@/components/FloatingCreatorChecklist";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  metadataBase: new URL('https://www.instafam.social'),
  title: {
    default: 'InstaFam - Connect with Your Favorite Creators',
    template: '%s | InstaFam'
  },
  description: 'Join InstaFam to connect with creators, earn points, unlock exclusive content, and support your favorite influencers through donations and premium perks. The ultimate creator-fan platform.',
  keywords: [
    'creators', 'influencers', 'exclusive content', 'fan community', 
    'creator support', 'social platform', 'content creators', 'fan engagement',
    'creator economy', 'monetization', 'vault items', 'creator dashboard',
    'fan points', 'donations', 'premium content', 'influencer marketing'
  ],
  authors: [{ name: 'InstaFam Team', url: 'https://www.instafam.social' }],
  creator: 'InstaFam',
  publisher: 'InstaFam',
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
    url: 'https://www.instafam.social',
    siteName: 'InstaFam',
    title: 'InstaFam - Connect with Your Favorite Creators',
    description: 'Join thousands of fans connecting with their favorite creators. Earn points, unlock exclusive content, and support creators through donations and premium perks.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'InstaFam - Creator Community Platform',
        type: 'image/jpeg',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InstaFam - Connect with Your Favorite Creators',
    description: 'Join thousands of fans connecting with their favorite creators. Earn points, unlock exclusive content, and support creators.',
    creator: '@instafam_official',
    site: '@instafam_official',
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
    canonical: 'https://www.instafam.social',
  },
  other: {
    'application-name': 'InstaFam',
    'apple-mobile-web-app-title': 'InstaFam',
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
        
        {/* Google Identity Services */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        <script src="https://apis.google.com/js/api.js" async defer></script>
        
        {/* JSON-LD Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "InstaFam",
              "url": "https://www.instafam.social",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.instafam.social/logo.png",
                "width": 512,
                "height": 512
              },
              "description": "The ultimate platform connecting creators with their fans through exclusive content, points, and donations.",
              "sameAs": [
                "https://instagram.com/_instafam_official",
                "https://twitter.com/instafam_official"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://www.instafam.social/contact",
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
              "name": "InstaFam",
              "url": "https://www.instafam.social",
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
          <ThemeProvider>
            <UserProvider>
              <PerformanceMonitor />
              <Navbar />
              <GoogleOneTap />
              <FloatingCreatorChecklist />
              <main role="main">
                {children}
              </main>
              <Footer />
            </UserProvider>
          </ThemeProvider>
          <Analytics />
        </SessionWrapper> 
      </body>
    </html>
  );
}
