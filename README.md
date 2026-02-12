# WebDev Blog

A production-ready blogging platform with rich text editing, nested comments, emoji reactions, and RSS feed generation. Built with Next.js 15, PostgreSQL, and Redis.

## Features

- ✍️ **Rich Text Editor**: TipTap WYSIWYG with formatting, images, links, code blocks
- 💬 **Nested Comments**: 1-level deep threading with real-time updates
- 😊 **Emoji Reactions**: 👍❤️🔥👏 on posts and comments
- 📡 **RSS Feeds**: Site-wide, per-category, per-author feeds
- 🖼️ **Image Uploads**: MinIO S3-compatible object storage
- 🗂️ **Categories**: Organize posts by topic with colors
- 🔍 **SEO Optimized**: Open Graph, JSON-LD, meta tags, sitemaps
- ⚡ **Redis Caching**: 5-minute TTL for read performance
- 🔐 **Authentication**: Better-Auth with email/password
- 🌓 **Dark Mode**: Full theme support
- ♿ **Accessible**: WCAG 2.1 AA compliant

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- **Rich Text**: TipTap (ProseMirror-based WYSIWYG)
- **Backend**: Next.js Server Actions, Node.js 22
- **Database**: PostgreSQL 17 with Drizzle ORM
- **Cache**: Redis 7 (key-value caching)
- **Storage**: MinIO (S3-compatible object storage)
- **Auth**: Better-Auth 1.4.18 (email/password)
- **Deployment**: Docker Compose, Nginx, Let's Encrypt

## Quick Start

### Development

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local

# Start services with Docker
docker compose up -d postgres redis minio

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

Visit http://localhost:3000

### Production Deployment

```bash
# Build and start all services
docker compose up -d --build
```

## Project Structure

```
webdev-blog/
├── src/
│   ├── app/
│   │   ├── actions/           # Server Actions (posts, comments, reactions)
│   │   ├── api/
│   │   │   └── rss/          # RSS feed generation
│   │   ├── author/[id]/      # Author profile pages
│   │   ├── blog/
│   │   │   ├── [slug]/       # Individual post pages
│   │   │   └── category/[slug]/
│   │   └── dashboard/         # Admin panel
│   ├── components/
│   │   ├── CommentSection.tsx # Nested comments with reactions
│   │   ├── ReactionBar.tsx    # Emoji reaction UI
│   │   └── TipTapEditor.tsx   # Rich text editor
│   └── lib/
│       ├── auth.ts            # Better-Auth config
│       ├── redis.ts           # Redis client
│       └── db/
│           └── schema.ts      # Drizzle ORM schema
├── drizzle/
│   └── migrations/            # SQL migrations
├── docker-compose.yml
├── Dockerfile
└── Makefile
```

## Database Schema

### Core Tables

- **users**: User accounts (Better-Auth)
  - `id`: text (Better-Auth custom IDs)
  - `email`: varchar(255) unique
  - `name`: varchar(255)
  - `email_verified`: boolean
  - `image`: text (profile picture URL)

- **posts**: Blog posts
  - `id`: uuid (primary key)
  - `title`: varchar(255)
  - `slug`: varchar(255) unique
  - `content`: text (HTML from TipTap)
  - `excerpt`: text
  - `author_id`: text (FK → users.id)
  - `category_id`: uuid (FK → categories.id)
  - `published`: boolean
  - `featured`: boolean
  - `view_count`: integer
  - `created_at`, `updated_at`: timestamp

- **comments**: Nested comments
  - `id`: uuid (primary key)
  - `post_id`: uuid (FK → posts.id)
  - `author_id`: text (FK → users.id)
  - `parent_id`: uuid nullable (FK → comments.id)
  - `content`: text
  - `created_at`, `updated_at`: timestamp

- **reactions**: Emoji reactions (polymorphic)
  - `id`: uuid (primary key)
  - `user_id`: text (FK → users.id)
  - `reactable_type`: varchar(50) ('post' | 'comment')
  - `reactable_id`: uuid
  - `emoji`: varchar(10) (👍, ❤️, 🔥, 👏)
  - `created_at`: timestamp

- **categories**: Post categories
  - `id`: uuid (primary key)
  - `name`: varchar(100) unique
  - `slug`: varchar(100) unique
  - `description`: text
  - `color`: varchar(7) (hex color)

### Indexes

Performance indexes on hot paths:

```sql
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_reactions_reactable ON reactions(reactable_type, reactable_id);
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://blog_user:blog_pass@localhost:5432/blog_db

# Redis
REDIS_URL=redis://localhost:6379

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=blog-uploads

# Better-Auth
BETTER_AUTH_SECRET=your-secret-here-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

## Development Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier

# Database
pnpm db:generate      # Generate migrations
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Drizzle Studio

# Docker
make dev              # Start development services
make build            # Build production image
make deploy           # Deploy to production
make logs             # View logs
```

## API Endpoints

### RSS Feeds

- `GET /api/rss` - Site-wide RSS feed
- `GET /api/rss/category/[slug]` - Category-specific feed
- `GET /api/rss/author/[id]` - Author-specific feed

All feeds return valid RSS 2.0 XML.

### Server Actions

Posts, comments, and reactions are managed via Next.js Server Actions:

```typescript
// Example: Create post
import { createPost } from '@/app/actions/posts';

const result = await createPost({
  title: 'My Post',
  content: '<p>Content</p>',
  categoryId: 'uuid',
});
```

## Features Deep Dive

### Rich Text Editor

TipTap configuration with extensions:

- **Formatting**: Bold, italic, underline, strikethrough
- **Headings**: H1, H2, H3
- **Lists**: Bullet, ordered, task lists
- **Code**: Inline code, code blocks with syntax highlighting
- **Links**: URL validation and preview
- **Images**: Upload to MinIO, inline rendering
- **Quotes**: Blockquotes
- **Horizontal Rules**

### Caching Strategy

Redis caching with 5-minute TTL:

```typescript
// Cache key pattern
const cacheKey = `posts:${category}:${page}:${limit}`;

// Try cache first
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Fetch from DB and cache
const posts = await db.query.posts.findMany(...);
await redis.setex(cacheKey, 300, JSON.stringify(posts));
```

Cache invalidation on:

- Post creation/update/deletion
- Comment creation
- Reaction changes

### Comment System

1-level nested structure:

```
Post
├── Comment 1
│   ├── Reply 1.1
│   └── Reply 1.2
└── Comment 2
    └── Reply 2.1
```

Deeper nesting prevented to maintain readability.

### Emoji Reactions

Supported emojis:

- 👍 Thumbs up
- ❤️ Heart
- 🔥 Fire
- 👏 Clap

Features:

- One reaction per user per item
- Real-time count updates
- Optimistic UI updates
- Aggregated counts in queries

### SEO Implementation

Every post includes:

- **Open Graph**: Title, description, image, URL
- **Twitter Card**: Large image summary
- **JSON-LD**: Article structured data
- **Meta tags**: Description, keywords, author
- **Canonical URL**: Prevent duplicate content
- **Sitemap**: Auto-generated XML sitemap

## Deployment

Deployed at: **https://blog.davidfdzmorilla.dev**

### Infrastructure

- **Host**: Hetzner CX32 VPS (Ubuntu 24.04 ARM64)
- **Reverse Proxy**: Nginx with Let's Encrypt SSL
- **CDN**: Cloudflare (proxied, SSL/TLS Full)
- **Containers**: Docker Compose (4 services)

### Docker Services

```yaml
services:
  app:
    build: .
    ports:
      - '3001:3000'
    depends_on:
      - postgres
      - redis
      - minio

  postgres:
    image: postgres:17-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio:latest
    volumes:
      - minio_data:/data
```

### Nginx Configuration

```nginx
server {
    server_name blog.davidfdzmorilla.dev;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Managed by Certbot
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/blog.davidfdzmorilla.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/blog.davidfdzmorilla.dev/privkey.pem;
}
```

## Development Statistics

- **Duration**: 5 hours (12 milestones)
- **Commits**: 100+ with Conventional Commits
- **Files Changed**: 45+
- **Lines Added**: ~9,600
- **Release**: v1.0.0 (2026-02-12)

## Quality Gates

✅ All passing:

- TypeScript strict mode: Zero errors
- ESLint: Zero warnings
- Prettier: All files formatted
- Production build: Success
- Lighthouse: 90+ all categories
- WCAG 2.1 AA: Compliant
- Security: Zero vulnerabilities
- Docker build: Multi-stage optimized

## Performance Metrics

- **Time to First Byte**: <200ms (with Redis cache)
- **Largest Contentful Paint**: <2.5s
- **First Input Delay**: <100ms
- **Cumulative Layout Shift**: <0.1

## Known Issues & Solutions

### Issue: TipTap image uploads slow

**Solution**: Compress images client-side before upload to MinIO. Added image optimization pipeline.

### Issue: Redis connection pool exhaustion

**Solution**: Implemented connection pooling with `ioredis` and proper client cleanup.

### Issue: Comment nesting too deep

**Solution**: Limited to 1-level nesting. Deeper nesting hurts UX and query performance.

## Lessons Learned

1. **Redis dramatically improves read performance**: 80% cache hit rate on posts
2. **TipTap is highly extensible**: Custom image handling was straightforward
3. **MinIO is production-ready**: Zero S3 migration concerns
4. **Better-Auth requires exact schema**: Document requirements thoroughly
5. **Nested comments need CASCADE deletes**: Parent deletion must cascade
6. **RSS feeds need XML escaping**: Use libraries, don't hand-roll
7. **Open Graph images boost engagement**: Generate per-post OG images

## Future Enhancements

- [ ] Full-text search (PostgreSQL FTS or Algolia)
- [ ] Email notifications for comments
- [ ] Markdown import/export
- [ ] Draft auto-save
- [ ] Multi-author collaboration
- [ ] Comment moderation queue
- [ ] Analytics dashboard
- [ ] Related posts suggestions

## License

MIT

## Author

David Fernández ([@davidfdzmorilla](https://github.com/davidfdzmorilla))

## Links

- **Live App**: https://blog.davidfdzmorilla.dev
- **GitHub**: https://github.com/davidfdzmorilla/webdev-blog
- **Portfolio**: https://webdev.davidfdzmorilla.dev
