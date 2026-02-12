import { NextResponse } from 'next/server';
import { getPostsByAuthor } from '@/app/actions/public';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { posts, author } = await getPostsByAuthor(id, 1, 50);

    if (!author) {
      return new NextResponse('Author not found', { status: 404 });
    }

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>WebDev Blog - ${author.name}</title>
    <link>https://blog.davidfdzmorilla.dev/author/${id}</link>
    <description>Posts by ${author.name}</description>
    <language>en-us</language>
    <atom:link href="https://blog.davidfdzmorilla.dev/api/rss/author/${id}" rel="self" type="application/rss+xml" />
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
