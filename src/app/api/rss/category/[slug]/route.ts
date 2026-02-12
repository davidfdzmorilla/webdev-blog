import { NextResponse } from 'next/server';
import { getPostsByCategory } from '@/app/actions/public';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { posts } = await getPostsByCategory(slug, 1, 50);

    if (posts.length === 0) {
      return new NextResponse('Category not found', { status: 404 });
    }

    const categoryName = posts[0].categories.find((c) => c.slug === slug)?.name || slug;

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>WebDev Blog - ${categoryName}</title>
    <link>https://blog.davidfdzmorilla.dev/blog/category/${slug}</link>
    <description>Posts in the ${categoryName} category</description>
    <language>en-us</language>
    <atom:link href="https://blog.davidfdzmorilla.dev/api/rss/category/${slug}" rel="self" type="application/rss+xml" />
    ${posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>https://blog.davidfdzmorilla.dev/blog/${post.slug}</link>
      <guid>https://blog.davidfdzmorilla.dev/blog/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <author>${post.author.name}</author>
      ${post.categories.map((cat) => `<category>${cat.name}</category>`).join('')}
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('RSS generation failed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
