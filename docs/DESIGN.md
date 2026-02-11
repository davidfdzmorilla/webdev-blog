# webdev-blog - Blog Platform Design

## Problem Statement

Build a multi-user blog platform with rich text editing, comments, reactions, image uploads, and SEO optimization. Users can create, edit, and publish blog posts with categories, while readers can comment and react to content.

## Architecture

### System Overview
```
┌─────────────────────────────────────────────────────────┐
│                     Next.js 15 App                      │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Pages     │  │ Server       │  │  API Routes   │  │
│  │  (RSC)      │  │ Actions      │  │  (RSS)        │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
              │                │              │
              ▼                ▼              ▼
   ┌──────────────────┐ ┌──────────────┐ ┌─────────────┐
   │   PostgreSQL     │ │   MinIO      │ │   Redis     │
   │   (Drizzle ORM)  │ │   (S3)       │ │   (Cache)   │
   └──────────────────┘ └──────────────┘ └─────────────┘
```

### Tech Stack
- **Frontend**: Next.js 15 App Router, React Server Components
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL 17 + Drizzle ORM
- **Auth**: Better-Auth (with roles: admin, author, reader)
- **Rich Editor**: TipTap
- **Storage**: MinIO (S3-compatible)
- **Cache**: Redis
- **Deployment**: Docker Compose

## Data Model

### Core Entities

#### Users
```typescript
{
  id: uuid (PK)
  email: string (unique)
  name: string
  bio: text (nullable)
  avatar_url: string (nullable)
  role: enum('admin', 'author', 'reader')
  created_at: timestamp
  updated_at: timestamp
}
```

#### Posts
```typescript
{
  id: uuid (PK)
  author_id: uuid (FK → users)
  title: string (max 255)
  slug: string (unique, indexed)
  content: text (HTML from TipTap)
  excerpt: text (max 500, nullable)
  featured_image: string (nullable, URL to MinIO)
  status: enum('draft', 'published')
  published_at: timestamp (nullable)
  created_at: timestamp
  updated_at: timestamp
}
```

#### Categories
```typescript
{
  id: uuid (PK)
  name: string (unique, max 100)
  slug: string (unique, indexed)
  description: text (nullable)
  created_at: timestamp
}
```

#### Post_Categories (many-to-many)
```typescript
{
  post_id: uuid (FK → posts)
  category_id: uuid (FK → categories)
  PRIMARY KEY (post_id, category_id)
}
```

#### Comments
```typescript
{
  id: uuid (PK)
  post_id: uuid (FK → posts)
  user_id: uuid (FK → users)
  parent_id: uuid (FK → comments, nullable, for replies)
  content: text
  created_at: timestamp
  updated_at: timestamp
}
```

#### Reactions
```typescript
{
  id: uuid (PK)
  post_id: uuid (FK → posts)
  user_id: uuid (FK → users)
  type: enum('like', 'heart', 'fire', 'clap')
  created_at: timestamp
  UNIQUE (post_id, user_id, type)
}
```

#### Media
```typescript
{
  id: uuid (PK)
  user_id: uuid (FK → users)
  filename: string
  original_filename: string
  url: string (MinIO URL)
  size: integer (bytes)
  mime_type: string
  created_at: timestamp
}
```

## API Design

### Pages (Server Components)
- `GET /` - Homepage (recent posts)
- `GET /blog` - All posts (paginated)
- `GET /blog/[slug]` - Single post view
- `GET /blog/category/[slug]` - Posts by category
- `GET /author/[id]` - Author profile with posts
- `GET /write` - Create/edit post (authors only)
- `GET /dashboard` - User dashboard

### Server Actions
- `createPost(data)` - Create new post (draft)
- `updatePost(id, data)` - Update post
- `publishPost(id)` - Publish draft
- `deletePost(id)` - Delete post (soft delete)
- `uploadImage(file)` - Upload to MinIO
- `addComment(postId, content)` - Add comment
- `addReaction(postId, type)` - Toggle reaction
- `removeReaction(postId, type)` - Remove reaction

### API Routes
- `GET /api/rss.xml` - RSS feed (all published posts)
- `GET /api/rss/category/[slug].xml` - Category RSS
- `GET /api/rss/author/[id].xml` - Author RSS

## Features

### Phase 1: Core Blog (MVP)
- [x] User authentication (Better-Auth with roles)
- [ ] Create/edit posts with TipTap editor
- [ ] Publish/unpublish posts
- [ ] Categories management
- [ ] View published posts
- [ ] Author profiles
- [ ] Responsive design

### Phase 2: Engagement
- [ ] Comments system (with nested replies)
- [ ] Reactions (like, heart, fire, clap)
- [ ] Image uploads to MinIO
- [ ] Featured images for posts

### Phase 3: Discovery & SEO
- [ ] SEO metadata (Open Graph, Twitter Cards)
- [ ] RSS feeds (global + per category/author)
- [ ] Search functionality (PostgreSQL full-text)
- [ ] Related posts
- [ ] Pagination

### Phase 4: Polish
- [ ] Redis caching for popular posts
- [ ] Draft autosave
- [ ] Post preview
- [ ] Dark mode
- [ ] Reading time estimate
- [ ] Table of contents

## Security

### Authentication & Authorization
- Better-Auth for session management
- Role-based access control (RBAC):
  - **admin**: Full access (edit any post, manage categories)
  - **author**: Create/edit own posts, upload images
  - **reader**: View posts, comment, react
- Protected routes for `/write` and `/dashboard`

### Input Validation
- Server-side validation with Zod schemas
- XSS prevention (sanitize TipTap HTML output)
- SQL injection prevention (Drizzle parameterized queries)
- File upload validation (type, size limits)

### Rate Limiting
- Comment creation: 5 per minute per user
- Image upload: 10 per hour per user
- Reaction toggle: 100 per minute per user

## Performance

### Optimization Strategies
- Server Components for static content
- Redis caching:
  - Published posts (5 min TTL)
  - Category lists (15 min TTL)
  - Author profiles (10 min TTL)
- Image optimization with Next.js Image
- Lazy loading for comments
- Incremental Static Regeneration (ISR) for post pages
- Database indexes on `slug`, `published_at`, `author_id`

### Metrics Targets
- Lighthouse: ≥90 all categories
- FCP: <1.5s
- LCP: <2.5s
- CLS: <0.1
- TTI: <3.5s

## Deployment

### Docker Services
```yaml
services:
  blog-app:
    build: .
    ports:
      - "3005:3000"
    depends_on:
      - blog-db
      - blog-redis
      - blog-minio
  
  blog-db:
    image: postgres:17-alpine
    volumes:
      - blog_postgres_data:/var/lib/postgresql/data
  
  blog-redis:
    image: redis:7-alpine
  
  blog-minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    volumes:
      - blog_minio_data:/data
```

### Environment Variables
```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://blog-redis:6379
MINIO_ENDPOINT=blog-minio:9000
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
MINIO_BUCKET=blog-images
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://blog.davidfdzmorilla.dev
```

### DNS
- Subdomain: `blog.davidfdzmorilla.dev`
- Cloudflare proxy: enabled
- SSL: Let's Encrypt

## Success Criteria

- [ ] All CRUD operations working for posts
- [ ] Rich text editor (TipTap) functional
- [ ] Image uploads to MinIO working
- [ ] Comments and reactions functional
- [ ] SEO metadata correct (validated with https://www.opengraph.xyz/)
- [ ] RSS feed valid (validated with https://validator.w3.org/feed/)
- [ ] Role-based access control enforced
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Lighthouse ≥90
- [ ] No TypeScript errors
- [ ] All ESLint rules passing
- [ ] Docker deployment successful
- [ ] HTTPS working on blog.davidfdzmorilla.dev

---

**Estimated Duration**: 4-5 hours  
**Complexity**: Medium-High (TipTap integration, MinIO setup, RSS generation)
