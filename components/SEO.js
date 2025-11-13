"use client";

import Head from 'next/head';

const SEO = ({
  title = "Sygil - Connect with Your Favorite Creators",
  description = "Join Sygil to connect with creators, earn points, unlock exclusive content, and support your favorite influencers through donations and premium perks.",
  keywords = "creators, influencers, exclusive content, fan community, creator support, social platform, content creators, fan engagement, creator economy",
  image = "https://www.sygil.app/og-image.jpg",
  url = "https://www.sygil.app",
  type = "website",
  twitterCard = "summary_large_image",
  author = "Sygil Team"
}) => {
  const siteTitle = title.includes('Sygil') ? title : `${title} | Sygil`;
  
  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="title" content={siteTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="language" content="English" />
      <meta name="theme-color" content="#FF1B6B" />
      <meta name="msapplication-TileColor" content="#FF1B6B" />
      <meta name="application-name" content="Sygil" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Sygil" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@sygil_official" />
      <meta name="twitter:site" content="@sygil_official" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="apple-mobile-web-app-title" content="Sygil" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Sygil",
            "url": "https://www.sygil.app",
            "description": description,
            "publisher": {
              "@type": "Organization",
              "name": "Sygil",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.sygil.app/logo.png"
              }
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.sygil.app/explore?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
    </Head>
  );
};

export default SEO;
