# WebDev Blog - Deployment Guide

## Prerequisites

- Hetzner CX32 VPS (Ubuntu 24.04 LTS)
- Docker and Docker Compose installed
- Nginx installed on host
- Domain: blog.davidfdzmorilla.dev configured in Cloudflare

## Environment Setup

1. **Clone the repository:**

   ```bash
   cd ~/projects
   git clone https://github.com/davidfdzmorilla/webdev-blog.git
   cd webdev-blog
   ```

2. **Create production environment file:**

   ```bash
   cp .env.example .env.local
   ```

3. **Generate secrets:**

   ```bash
   # Generate Better-Auth secret
   openssl rand -base64 32

   # Update .env.local with production values
   ```

4. **Configure environment variables:**
   ```bash
   DATABASE_URL=postgresql://blog_user:STRONG_PASSWORD@localhost:5432/blog_db
   REDIS_URL=redis://localhost:6379
   MINIO_ENDPOINT=localhost:9000
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=STRONG_PASSWORD
   MINIO_BUCKET=blog-images
   BETTER_AUTH_SECRET=<generated-secret>
   BETTER_AUTH_URL=https://blog.davidfdzmorilla.dev
   NODE_ENV=production
   ```

## Docker Deployment

1. **Build and start services:**

   ```bash
   make deploy
   ```

   Or manually:

   ```bash
   docker build -t webdev-blog:latest .
   docker-compose up -d
   ```

2. **Run database migrations:**

   ```bash
   make db-migrate
   ```

3. **Verify services are running:**
   ```bash
   docker-compose ps
   ```

## Nginx Configuration

1. **Copy Nginx configuration:**

   ```bash
   sudo cp nginx/blog.conf /etc/nginx/sites-available/blog.davidfdzmorilla.dev
   sudo ln -s /etc/nginx/sites-available/blog.davidfdzmorilla.dev /etc/nginx/sites-enabled/
   ```

2. **Test Nginx configuration:**

   ```bash
   sudo nginx -t
   ```

3. **Reload Nginx:**
   ```bash
   sudo systemctl reload nginx
   ```

## SSL Certificate (Let's Encrypt)

1. **Stop Nginx temporarily:**

   ```bash
   sudo systemctl stop nginx
   ```

2. **Obtain certificate:**

   ```bash
   sudo certbot certonly --standalone -d blog.davidfdzmorilla.dev
   ```

3. **Start Nginx:**

   ```bash
   sudo systemctl start nginx
   ```

4. **Configure auto-renewal:**
   ```bash
   sudo certbot renew --dry-run
   ```

## Cloudflare DNS Configuration

1. **Create A record:**

   ```bash
   # Using Cloudflare API
   curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records" \
     -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
     -H "Content-Type: application/json" \
     --data '{
       "type": "A",
       "name": "blog",
       "content": "'${SERVER_IP}'",
       "ttl": 1,
       "proxied": true
     }'
   ```

2. **Verify DNS propagation:**
   ```bash
   dig +short blog.davidfdzmorilla.dev
   ```

## Post-Deployment Verification

1. **Check application logs:**

   ```bash
   make logs
   ```

2. **Verify database connection:**

   ```bash
   make psql
   \dt
   \q
   ```

3. **Test Redis:**

   ```bash
   make redis-cli
   PING
   exit
   ```

4. **Access the site:**
   - Open https://blog.davidfdzmorilla.dev
   - Create test user
   - Create test post
   - Verify all features work

## Monitoring & Maintenance

### View Logs

```bash
make logs                    # Application logs
docker-compose logs postgres # Database logs
docker-compose logs redis    # Redis logs
docker-compose logs minio    # MinIO logs
```

### Database Backup

```bash
make backup-db
```

### Database Restore

```bash
make restore-db FILE=backup-20260212-120000.sql
```

### Update Deployment

```bash
cd ~/projects/webdev-blog
git pull origin main
make deploy
```

## Troubleshooting

### Application not starting

```bash
docker-compose logs app
# Check for connection errors
# Verify DATABASE_URL is correct
```

### Database connection issues

```bash
docker-compose restart postgres
docker-compose logs postgres
```

### Redis connection issues

```bash
docker-compose restart redis
docker-compose logs redis
```

### SSL certificate renewal

```bash
sudo certbot renew
sudo systemctl reload nginx
```

## Security Checklist

- [ ] Strong database passwords set
- [ ] Better-Auth secret is random and ≥32 characters
- [ ] MinIO credentials changed from defaults
- [ ] Firewall configured (ports 22, 80, 443 only)
- [ ] SSH key-based authentication enabled
- [ ] Regular security updates applied
- [ ] Database backups automated
- [ ] SSL certificate auto-renewal configured

## Performance Tuning

### PostgreSQL

```bash
# Edit postgresql.conf
docker-compose exec postgres vi /var/lib/postgresql/data/postgresql.conf

# Recommended settings for 8GB RAM:
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 10MB
min_wal_size = 1GB
max_wal_size = 4GB
```

### Redis

```bash
# Redis is already configured optimally in docker-compose.yml
# maxmemory: 512MB
# maxmemory-policy: allkeys-lru
```

### Next.js

- Build optimization already configured
- Static generation for public pages
- ISR (Incremental Static Regeneration) enabled
- Image optimization with next/image

## Rollback Procedure

1. **Stop current deployment:**

   ```bash
   docker-compose down
   ```

2. **Checkout previous version:**

   ```bash
   git checkout <previous-tag>
   ```

3. **Rebuild and deploy:**

   ```bash
   make deploy
   ```

4. **Restore database if needed:**
   ```bash
   make restore-db FILE=<backup-file>
   ```

## Support

For issues or questions:

- GitHub Issues: https://github.com/davidfdzmorilla/webdev-blog/issues
- Documentation: https://docs.davidfdzmorilla.dev
