.PHONY: help dev build test lint format clean deploy logs

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start development server
	pnpm run dev

build: ## Build for production
	pnpm run build

test: ## Run tests
	pnpm run test

lint: ## Run linter
	pnpm run lint

format: ## Format code
	pnpm run format

clean: ## Clean build artifacts and node_modules
	rm -rf .next node_modules .turbo

deploy: ## Deploy to production
	@echo "Building Docker image..."
	docker build -t webdev-blog:latest .
	@echo "Stopping existing containers..."
	docker-compose down
	@echo "Starting new containers..."
	docker-compose up -d
	@echo "Deployment complete!"

logs: ## View application logs
	docker-compose logs -f app

db-migrate: ## Run database migrations
	pnpm drizzle-kit push

db-studio: ## Open Drizzle Studio
	pnpm drizzle-kit studio

redis-cli: ## Connect to Redis CLI
	docker-compose exec redis redis-cli

psql: ## Connect to PostgreSQL
	docker-compose exec postgres psql -U blog_user -d blog_db

backup-db: ## Backup database
	docker-compose exec postgres pg_dump -U blog_user blog_db > backup-$(shell date +%Y%m%d-%H%M%S).sql

restore-db: ## Restore database (usage: make restore-db FILE=backup.sql)
	docker-compose exec -T postgres psql -U blog_user -d blog_db < $(FILE)
