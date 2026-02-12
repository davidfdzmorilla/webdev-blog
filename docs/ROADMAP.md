# webdev-blog - Development Roadmap

## Milestones

### M1: Project Setup & Infrastructure (30 min)

**Status**: 🔄 In Progress

**Tasks**:

- [x] Create design documents (DESIGN.md, ROADMAP.md)
- [ ] Initialize Next.js 15 project
- [ ] Configure TypeScript (strict mode)
- [ ] Set up ESLint + Prettier
- [ ] Configure Husky + lint-staged + commitlint
- [ ] Create Dockerfile (multi-stage)
- [ ] Create docker-compose.yml (app + postgres + redis + minio)
- [ ] Set up GitHub repository
- [ ] Configure Drizzle ORM
- [ ] Create database schema
- [ ] Generate initial migration
- [ ] Create .env.example

**Deliverables**:

- ✅ Project scaffolding complete
- ✅ Docker builds successfully
- ✅ Database connection working
- ✅ GitHub repo initialized

---

### M2: Authentication & User Management (45 min)

**Status**: ⏳ Pending

**Tasks**:

- [ ] Configure Better-Auth with roles
- [ ] Create auth API routes
- [ ] Implement signup page
- [ ] Implement login page
- [ ] Implement logout functionality
- [ ] Create auth middleware for protected routes
- [ ] Build user profile page
- [ ] Add role-based UI conditionals

**Deliverables**:

- ✅ Users can signup/login/logout
- ✅ Role assignment working (admin/author/reader)
- ✅ Protected routes enforced
- ✅ Auth state persists across page loads

---

### M3: Post Creation & Management (60 min)

**Status**: ⏳ Pending

**Tasks**:

- [ ] Install and configure TipTap editor
- [ ] Create `/write` page (protected, authors only)
- [ ] Build post creation form
- [ ] Implement Server Action: createPost
- [ ] Implement Server Action: updatePost
- [ ] Implement Server Action: publishPost
- [ ] Implement Server Action: deletePost
- [ ] Add draft/published status toggle
- [ ] Create post list view for authors (/dashboard/posts)
- [ ] Add slug generation from title
- [ ] Implement excerpt auto-generation

**Deliverables**:

- ✅ Authors can create/edit posts
- ✅ TipTap editor working with formatting
- ✅ Drafts saved automatically
- ✅ Posts can be published/unpublished
- ✅ Slug generation working

---

### M4: Categories & Organization (30 min)

**Status**: ⏳ Pending

**Tasks**:

- [ ] Create categories management UI (admin only)
- [ ] Implement Server Action: createCategory
- [ ] Implement Server Action: updateCategory
- [ ] Implement Server Action: deleteCategory
- [ ] Add category selector in post editor
- [ ] Create category index page (/blog/category/[slug])
- [ ] Add category badges to post cards

**Deliverables**:

- ✅ Admins can manage categories
- ✅ Authors can assign categories to posts
- ✅ Category pages show filtered posts
- ✅ Category slugs are URL-friendly

---

### M5: Image Uploads & Media (45 min)

**Status**: ⏳ Pending

**Tasks**:

- [ ] Configure MinIO in docker-compose
- [ ] Install AWS SDK for S3-compatible uploads
- [ ] Create image upload Server Action
- [ ] Build image picker component for TipTap
- [ ] Add featured image upload to post editor
- [ ] Create media library page
- [ ] Add image optimization (compress before upload)
- [ ] Implement image deletion

**Deliverables**:

- ✅ Images upload to MinIO successfully
- ✅ Images can be inserted in posts via TipTap
- ✅ Featured images display on post cards
- ✅ Media library shows all user uploads
- ✅ Image URLs are publicly accessible

---

### M6: Public Blog Pages (45 min)

**Status**: ✅ Complete

**Tasks**:

- [ ] Create homepage (/) with recent posts
- [ ] Create blog index (/blog) with pagination
- [ ] Create single post page (/blog/[slug])
- [ ] Create author profile page (/author/[id])
- [ ] Add SEO metadata component
- [ ] Generate Open Graph images
- [ ] Add JSON-LD structured data
- [ ] Implement reading time calculation
- [ ] Create related posts logic

**Deliverables**:

- ✅ Homepage shows recent 6 posts
- ✅ Blog index paginates correctly
- ✅ Post pages render rich content
- ✅ Author pages show all author posts
- ✅ SEO metadata validates correctly

---

### M7: Comments System (45 min)

**Status**: ⏳ Pending

**Tasks**:

- [ ] Create comments schema (with parent_id for nesting)
- [ ] Generate migration
- [ ] Implement Server Action: addComment
- [ ] Implement Server Action: deleteComment
- [ ] Build comment component (with reply support)
- [ ] Add comment list to post page
- [ ] Add comment count badge
- [ ] Implement optimistic UI for new comments
- [ ] Add rate limiting (5 comments/min)

**Deliverables**:

- ✅ Users can comment on posts
- ✅ Nested replies work (1 level deep)
- ✅ Comment count displays correctly
- ✅ Authors can delete comments on their posts
- ✅ Rate limiting prevents spam

---

### M8: Reactions System (30 min)

**Status**: ⏳ Pending

**Tasks**:

- [ ] Create reactions schema
- [ ] Generate migration
- [ ] Implement Server Action: toggleReaction
- [ ] Build reaction picker component
- [ ] Add reaction counts to post cards
- [ ] Add reaction counts to post pages
- [ ] Implement optimistic UI for reactions
- [ ] Ensure unique constraint (user + post + type)

**Deliverables**:

- ✅ Users can react to posts (like, heart, fire, clap)
- ✅ Reaction counts display in real-time
- ✅ Users can toggle reactions on/off
- ✅ Duplicate reactions prevented

---

### M9: RSS Feeds (30 min)

**Status**: ⏳ Pending

**Tasks**:

- [ ] Create /api/rss.xml route (all posts)
- [ ] Create /api/rss/category/[slug].xml route
- [ ] Create /api/rss/author/[id].xml route
- [ ] Add RSS link to header
- [ ] Validate RSS with W3C Feed Validator
- [ ] Add RSS autodiscovery meta tag

**Deliverables**:

- ✅ RSS feed generates valid XML
- ✅ Feeds update when posts publish
- ✅ Category and author feeds work
- ✅ RSS validates with W3C

---

### M10: Performance & Caching (30 min)

**Status**: ⏳ Pending

**Tasks**:

- [ ] Configure Redis client
- [ ] Implement cache for published posts (5 min TTL)
- [ ] Implement cache for categories (15 min TTL)
- [ ] Implement cache for author profiles (10 min TTL)
- [ ] Add cache invalidation on post publish/update
- [ ] Add database indexes (slug, published_at, author_id)
- [ ] Enable ISR for post pages (revalidate: 300)
- [ ] Optimize images with next/image
- [ ] Add lazy loading for comments

**Deliverables**:

- ✅ Redis caching active
- ✅ Cache hit rate >70%
- ✅ Page load time <2s
- ✅ Database queries optimized

---

### M11: Deployment & Testing (45 min)

**Status**: ⏳ Pending

**Tasks**:

- [ ] Create Makefile with common commands
- [ ] Write Nginx reverse proxy config
- [ ] Configure Cloudflare DNS (blog.davidfdzmorilla.dev)
- [ ] Build Docker image
- [ ] Deploy with docker-compose
- [ ] Obtain SSL certificate (Let's Encrypt)
- [ ] Verify HTTPS working
- [ ] Run Lighthouse audit (target ≥90)
- [ ] Test all user flows (signup, post, comment, react)
- [ ] Validate SEO metadata
- [ ] Validate RSS feed
- [ ] Test responsive design (mobile/tablet/desktop)

**Deliverables**:

- ✅ Site live at https://blog.davidfdzmorilla.dev
- ✅ SSL certificate valid
- ✅ Lighthouse score ≥90
- ✅ All features functional
- ✅ No console errors

---

### M12: Documentation & Release (20 min)

**Status**: ⏳ Pending

**Tasks**:

- [ ] Write README.md
- [ ] Create CHANGELOG.md
- [ ] Document environment variables
- [ ] Create GitHub release (v1.0.0)
- [ ] Tag release
- [ ] Push to GitHub
- [ ] Update portfolio (add webdev-blog project)
- [ ] Update PROGRESS.json

**Deliverables**:

- ✅ README complete with setup instructions
- ✅ CHANGELOG created
- ✅ Release v1.0.0 tagged
- ✅ Project added to portfolio
- ✅ PROGRESS.json updated

---

## Timeline

**Total Estimated**: 6 hours  
**Start**: 2026-02-11 23:47 UTC  
**Target Completion**: 2026-02-12 05:47 UTC

## Progress Tracking

- **Milestones Complete**: 0/12
- **Overall Progress**: 0%
- **Current Milestone**: M1 (Project Setup)

---

## Next Actions

1. ✅ Create DESIGN.md and ROADMAP.md
2. ⏭️ Initialize Next.js 15 project
3. ⏭️ Configure tooling (ESLint, Prettier, Husky)
4. ⏭️ Set up Docker infrastructure
5. ⏭️ Initialize GitHub repository

---

**Let's build! 🚀**
