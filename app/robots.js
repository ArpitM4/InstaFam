export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/creator/',
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
          '/creator/',
          '/upload-blog/',
          '/api/',
          '/admin/',
          '/account/',
          '/my-fam-points/',
          '/unverified/',
        ],
      },
    ],
    sitemap: 'https://www.sygil.app/sitemap.xml',
    host: 'https://www.sygil.app',
  };
}
