export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/upload-blog/',
          '/api/',
          '/admin/',
          '/account/',
          '/my-fam-points/',
          '/unverified/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/upload-blog/',
          '/api/',
          '/admin/',
          '/account/',
          '/my-fam-points/',
          '/unverified/',
        ],
      },
    ],
    sitemap: 'https://www.instafam.social/sitemap.xml',
    host: 'https://www.instafam.social',
  };
}
