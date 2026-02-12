# WebDev Blog

A production-ready, full-stack blogging platform built with Next.js 15, PostgreSQL, TypeScript, and modern web technologies.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

**Live Demo:** [https://blog.davidfdzmorilla.dev](https://blog.davidfdzmorilla.dev)

## Features

### Core Functionality

- ✅ **Authentication**: Email/password with Better-Auth, role-based access (admin/author/reader)
- ✅ **Post Management**: Rich text editor (TipTap), drafts, publishing, featured images
- ✅ **Categories**: Organize posts with multiple categories
- ✅ **Comments**: Nested comments (1-level deep) with authentication
- ✅ **Reactions**: Like, heart, fire, and clap emoji reactions with optimistic UI
- ✅ **Media Upload**: Image upload to MinIO/S3 with validation
- ✅ **RSS Feeds**: Full site, by category, and by author

### Performance & UX

- ⚡ **Redis Caching**: 5-minute TTL for published posts
- 🗄️ **Database Indexes**: Optimized queries for posts, comments, reactions
- 🎨 **Responsive Design**: Mobile-first, Tailwind CSS 4
- 🔍 **SEO Optimized**: Open Graph, Twitter Cards, JSON-LD structured data
- 📱 **Progressive Enhancement**: Works without JavaScript

### Developer Experience

- 🔒 **TypeScript Strict Mode**: Full type safety
- 🎣 **Git Hooks**: Husky + lint-staged + commitlint
- 🧪 **Code Quality**: ESLint + Prettier
- 🐳 **Docker**: Multi-stage builds, Docker Compose
- 📝 **Documentation**: Comprehensive guides

## Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4
- **Rich Text**: TipTap Editor
- **State**: React Server Components + Server Actions

### Backend

- **Database**: PostgreSQL 17
- **ORM**: Drizzle ORM
- **Cache**: Redis
- **Storage**: MinIO (S3-compatible)
- **Auth**: Better-Auth

### Infrastructure

- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt
- **DNS**: Cloudflare

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm 10+
- Docker and Docker Compose
- PostgreSQL 17 (via Docker)
- Redis (via Docker)
- MinIO (via Docker)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/davidfdzmorilla/webdev-blog.git
   cd webdev-blog
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your values:

   ```env
   DATABASE_URL=postgresql://blog_user:blog_password@localhost:5432/blog_db
   REDIS_URL=redis://localhost:6379
   MINIO_ENDPOINT=localhost:9000
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=minioadmin
   MINIO_BUCKET=blog-images
   BETTER_AUTH_SECRET=$(openssl rand -base64 32)
   BETTER_AUTH_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Start infrastructure services:**

   ```bash
   docker-compose up -d postgres redis minio
   ```

5. **Run database migrations:**

   ```bash
   pnpm drizzle-kit push
   ```

6. **Start development server:**

   ```bash
   pnpm dev
   ```

7. **Open browser:**
   ```
   http://localhost:3000
   ```

## Project Structure

```
webdev-blog/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── actions/         # Server Actions
│   │   ├── api/             # API routes (auth, RSS)
│   │   ├── auth/            # Auth pages (login, signup)
│   │   ├── blog/            # Public blog pages
│   │   ├── dashboard/       # Protected admin pages
│   │   └── write/           # Post editor
│   ├── components/          # React components
│   ├── lib/                 # Utilities & configs
│   │   ├── auth.ts          # Better-Auth config
│   │   ├── db/              # Drizzle schema
│   │   ├── redis.ts         # Redis client
│   │   └── s3.ts            # MinIO/S3 client
│   └── types/               # TypeScript types
├── docs/                    # Documentation
├── nginx/                   # Nginx configs
├── drizzle/                 # Database migrations
├── docker-compose.yml       # Docker services
├── Dockerfile               # Multi-stage build
├── Makefile                 # Common commands
└── DEPLOYMENT.md            # Deployment guide
```

## Development

### Available Commands

```bash
make dev          # Start development server
make build        # Build for production
make lint         # Run ESLint
make format       # Format with Prettier
make clean        # Remove build artifacts
make deploy       # Deploy with Docker
make logs         # View application logs
make db-migrate   # Run migrations
make db-studio    # Open Drizzle Studio
make redis-cli    # Connect to Redis
make psql         # Connect to PostgreSQL
```

### Git Workflow

This project follows **Conventional Commits** and uses a feature-branch workflow:

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes with conventional commits: `feat: add feature`
3. Push and create PR to `develop`
4. Merge to `main` for release

**Commit Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

### Database Migrations

```bash
# Generate migration
pnpm drizzle-kit generate

# Push to database
pnpm drizzle-kit push

# Open Drizzle Studio
pnpm drizzle-kit studio
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick deploy:**

```bash
make deploy
```

## Architecture

### Authentication Flow

1. User signs up/logs in via Better-Auth
2. Session stored in PostgreSQL
3. Role-based access control (admin/author/reader)
4. Protected routes enforced by middleware

### Content Management

1. Authors create posts in TipTap editor
2. Images uploaded to MinIO/S3
3. Drafts saved, publish sets `status` and `publishedAt`
4. Cache invalidated on publish

### Performance Strategy

- **Redis**: Cache published posts, categories, author profiles
- **ISR**: Incremental Static Regeneration for public pages
- **Indexes**: Database indexes on frequently queried columns
- **CDN**: Cloudflare proxy for static assets

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Follow the existing code style
4. Write meaningful commit messages
5. Add tests for new features
6. Submit a pull request

## License

MIT License - see [LICENSE](./LICENSE) for details

## Author

**davidfdzmorilla**

- GitHub: [@davidfdzmorilla](https://github.com/davidfdzmorilla)
- Portfolio: [https://webdev.davidfdzmorilla.dev](https://webdev.davidfdzmorilla.dev)

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Better-Auth](https://better-auth.com/) - Authentication library
- [TipTap](https://tiptap.dev/) - Rich text editor
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

---

Built with ❤️ by davidfdzmorilla
