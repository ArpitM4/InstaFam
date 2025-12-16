import connectDB from "@/db/ConnectDb";
import Blog from "@/models/Blog";
import User from "@/models/User";

/**
 * Generate comprehensive sitemap for Sygil
 * Includes: Static pages, Creator profiles, Blog posts, Creator sub-pages
 */
export default async function sitemap() {
  const baseUrl = 'https://www.sygil.app';
  const currentDate = new Date();

  // Core static pages - Always included
  const corePages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/creators`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // Content pages
  const contentPages = [
    {
      url: `${baseUrl}/blogs`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Legal pages
  const legalPages = [
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacypolicy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];

  // All static pages combined
  const staticPages = [...corePages, ...contentPages, ...legalPages];

  try {
    // Connect to database
    await connectDB();

    // Get all published blog posts
    const blogs = await Blog.find({ status: { $ne: 'draft' } })
      .sort({ createdAt: -1 })
      .select('slug updatedAt createdAt')
      .lean();

    // Get all public creators
    const creators = await User.find({
      accountType: 'Creator',
      visibility: 'public',
      username: { $exists: true, $ne: null, $ne: '' }
    })
      .select('username updatedAt createdAt')
      .lean();

    // Blog post pages
    const blogPages = blogs.map((blog) => ({
      url: `${baseUrl}/blogs/${blog.slug}`,
      lastModified: new Date(blog.updatedAt || blog.createdAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // Creator profile pages - Main page
    const creatorPages = creators.map((creator) => ({
      url: `${baseUrl}/${creator.username}`,
      lastModified: new Date(creator.updatedAt || creator.createdAt || currentDate),
      changeFrequency: 'daily',
      priority: 0.8,
    }));

    // Creator sub-pages (vault, contribute, etc.) - Only for active creators
    const creatorSubPages = creators.flatMap((creator) => {
      const username = creator.username;
      const lastMod = new Date(creator.updatedAt || creator.createdAt || currentDate);

      return [
        {
          url: `${baseUrl}/${username}/vault`,
          lastModified: lastMod,
          changeFrequency: 'daily',
          priority: 0.7,
        },
        {
          url: `${baseUrl}/${username}/contribute`,
          lastModified: lastMod,
          changeFrequency: 'weekly',
          priority: 0.6,
        },
      ];
    });

    return [
      ...staticPages,
      ...blogPages,
      ...creatorPages,
      ...creatorSubPages,
    ];

  } catch (error) {
    console.error('Error generating sitemap:', error);

    // Return basic sitemap if database connection fails
    return [
      ...staticPages,
      // Fallback entries
      {
        url: `${baseUrl}/blogs`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ];
  }
}
