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
    sitemap: 'https://instafam.vercel.app/sitemap.xml',
    host: 'https://instafam.vercel.app',
  };
}
