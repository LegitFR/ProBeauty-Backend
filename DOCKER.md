# 🐳 Docker Deployment Guide - ProBeauty Backend

This guide explains how to run the ProBeauty backend using Docker for both development and production environments.

---

## 📋 Prerequisites

- **Docker** (v20.10 or higher)
- **Docker Compose** (v2.0 or higher)
- **PostgreSQL Database** (external or use local Docker container)

---

## 🎯 Two Database Options

This project supports two deployment modes:

### **Option 1: External Database (Recommended - Default)**
Use your existing PostgreSQL database (cloud-hosted, local, or remote). This is the default configuration.

### **Option 2: Local Docker Database**
Run PostgreSQL in a Docker container alongside the application.

---

## 🚀 Quick Start - Using External Database (Default)

This setup uses your existing PostgreSQL database from your current `.env` file.

### 1. Verify Your Environment Variables

Make sure your existing `.env` file has:

- `DATABASE_URL` - Your PostgreSQL connection string
- `PORT` - Application port (default: 5000)
- `ACCESS_SECRET_KEY` - JWT access token secret
- `REFRESH_SECRET_KEY` - JWT refresh token secret
- Email SMTP credentials (`EMAIL_USERNAME`, `EMAIL_PASSWORD`, etc.)
- Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, etc.)

### 2. Start the Application

```bash
docker-compose up -d
```

This will start:
- **ProBeauty Backend** on port `5000` (or your configured PORT)
- Connects to your external PostgreSQL database using `DATABASE_URL` from `.env`

### 3. View Logs

```bash
docker-compose logs -f app
```

### 4. Access the Application

- **API Base URL**: http://localhost:5000/api

### 5. Stop the Application

```bash
docker-compose down
```

---

## 🗄️ Quick Start - Using Local Docker Database

If you want to run PostgreSQL in Docker instead of using an external database:

### 1. Setup Environment Variables

Copy the example file:

```bash
cp .env.docker.example .env.local
```

Edit `.env.local` and configure:

- `POSTGRES_USER` - Database username (default: probeauty)
- `POSTGRES_PASSWORD` - Database password (change this!)
- `POSTGRES_DB` - Database name (default: probeauty_db)
- `POSTGRES_PORT` - Database port (default: 5432)
- `ACCESS_SECRET_KEY` - Strong secret for JWT access tokens (min 32 chars)
- `REFRESH_SECRET_KEY` - Strong secret for JWT refresh tokens (min 32 chars)
- Email and Cloudinary credentials

### 2. Start with Local Database

```bash
docker-compose -f docker-compose.local-db.yml --env-file .env.local up -d
```

This will start:
- **PostgreSQL** database on port `5432`
- **ProBeauty Backend** on port `5000`
- **pgAdmin** (optional) on port `5050` for database management

### 3. Access Services

- **API Base URL**: http://localhost:5000/api
- **pgAdmin**: http://localhost:5050 (credentials in `.env.local`)

### 4. Stop the Application

```bash
docker-compose -f docker-compose.local-db.yml down
```

To remove volumes (database data):

```bash
docker-compose -f docker-compose.local-db.yml down -v
```

---

## 🏭 Production Deployment

### 1. Setup Production Environment

Create a production `.env` file:

```bash
cp .env.docker.example .env.production
```

**IMPORTANT**: Use strong, random secrets for production:

```bash
# Generate secure secrets
openssl rand -base64 64
```

Update `.env.production` with:
- Strong `POSTGRES_PASSWORD`
- Strong `ACCESS_SECRET_KEY` (64+ chars)
- Strong `REFRESH_SECRET_KEY` (64+ chars)
- Production email credentials
- Production Cloudinary credentials
- Set `NODE_ENV=production`

### 2. Start Production Stack

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### 3. Production Stack Includes

- **PostgreSQL** with resource limits and health checks
- **ProBeauty Backend** with automatic restarts and logging
- **Nginx** reverse proxy (optional) for SSL/TLS termination

### 4. Configure Nginx (Optional)

If using the Nginx service, create the configuration:

```bash
mkdir -p nginx
```

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server app:5000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /health {
            proxy_pass http://backend/health;
        }
    }
}
```

For SSL/TLS, place certificates in `nginx/ssl/` and update the nginx config.

---

## 🛠️ Common Operations

### Database Migrations

Migrations run automatically when the container starts. To run manually:

**External Database:**
```bash
docker-compose exec app bunx prisma migrate deploy
```

**Local Docker Database:**
```bash
docker-compose -f docker-compose.local-db.yml exec app bunx prisma migrate deploy
```

### Generate Prisma Client

```bash
docker-compose exec app bunx prisma generate
```

### Access Database Shell

**If using Local Docker Database:**
```bash
docker-compose -f docker-compose.local-db.yml exec postgres psql -U probeauty -d probeauty_db
```

**If using External Database:**
Connect using your regular database client with your `DATABASE_URL` credentials.

### Restart a Service

```bash
docker-compose restart app
```

### Rebuild Containers

After changing the Dockerfile or dependencies:

```bash
docker-compose build --no-cache
docker-compose up -d
```

### View Container Resource Usage

```bash
docker stats
```

---

## 📊 Database Backups

### Manual Backup (Local Docker Database Only)

```bash
docker-compose -f docker-compose.local-db.yml exec postgres pg_dump -U probeauty probeauty_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore from Backup (Local Docker Database Only)

```bash
docker-compose -f docker-compose.local-db.yml exec -T postgres psql -U probeauty -d probeauty_db < backup.sql
```

### External Database Backups

If using an external database, use your database provider's backup tools or standard PostgreSQL tools:

```bash
# Direct connection to external database
pg_dump -h your-db-host -U your-user -d your-db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Automated Backups (Production)

For local Docker database:
```bash
# Example crontab entry (daily backup at 2 AM)
0 2 * * * cd /path/to/probeauty/backend && docker-compose -f docker-compose.local-db.yml exec -T postgres pg_dump -U probeauty probeauty_db | gzip > /backups/probeauty_$(date +\%Y\%m\%d).sql.gz
```

---

## 🔍 Troubleshooting

### Container Won't Start

Check logs:
```bash
docker-compose logs app
```

### Database Connection Issues

**For External Database:**
- Verify your `DATABASE_URL` is correct in `.env`
- Ensure the database is accessible from Docker (use `host.docker.internal` on Mac/Windows for localhost databases)
- Check if your database requires SSL/TLS connections
- If using localhost database, the container uses `network_mode: "host"` to access it

**For Local Docker Database:**
```bash
docker-compose -f docker-compose.local-db.yml ps
docker-compose -f docker-compose.local-db.yml exec postgres pg_isready -U probeauty
```

### Connecting to Localhost Database from Docker

If your `DATABASE_URL` points to `localhost`:

**On Mac/Windows:**
Replace `localhost` with `host.docker.internal`:
```env
DATABASE_URL=postgresql://user:pass@host.docker.internal:5432/dbname
```

**On Linux:**
The default `docker-compose.yml` uses `network_mode: "host"` which allows the container to access localhost directly.

### Port Already in Use

Change ports in `.env`:
```env
PORT=5001
POSTGRES_PORT=5433  # Only for local Docker database
PGADMIN_PORT=5051   # Only for local Docker database
```

### Clear Everything and Start Fresh

**External Database:**
```bash
docker-compose down
docker system prune -a
docker-compose up -d
```

**Local Docker Database:**
```bash
docker-compose -f docker-compose.local-db.yml down -v
docker system prune -a
docker-compose -f docker-compose.local-db.yml up -d
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use strong secrets** in production (64+ character random strings)
3. **Regularly update** Docker images:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```
4. **Enable SSL/TLS** in production using Nginx or a reverse proxy
5. **Restrict database access** - Don't expose PostgreSQL port in production
6. **Use Docker secrets** for sensitive data in production orchestration
7. **Regular backups** - Automate database backups
8. **Monitor logs** for security issues

---

## 📦 Container Architecture

```
┌─────────────────────────────────────────┐
│         Nginx (Optional)                │
│     SSL/TLS Termination                 │
│         Port 80/443                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      ProBeauty Backend (Bun)            │
│       Express + Prisma                  │
│         Port 5000                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      PostgreSQL Database                │
│         Port 5432                       │
└─────────────────────────────────────────┘
```

---

## 🚢 Deployment Platforms

This Docker setup works with:

- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**
- **Railway**
- **Render**
- **Fly.io**
- **Self-hosted VPS** (with Docker installed)

### Example: Deploy to Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Create project: `railway init`
4. Set environment variables in Railway dashboard
5. Deploy: `railway up`

---

## 📝 Development Workflow

### Hot Reload Development

The docker-compose files mount your source code for changes, but Bun doesn't auto-reload in Docker by default.

**Option 1: Run app locally, database in Docker**
```bash
bun install
# Start only the database
docker-compose -f docker-compose.local-db.yml up postgres -d
# Update .env DATABASE_URL to: postgresql://probeauty:probeauty_dev_password@localhost:5432/probeauty_db
bun run dev
```

**Option 2: Use your existing external database**
```bash
bun install
# Your .env already has DATABASE_URL configured
bun run dev
```

### Running Tests in Docker

```bash
docker-compose exec app bun test
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Bun Documentation](https://bun.sh/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## ✅ Health Checks

The Dockerfile includes a health check endpoint. Ensure your application has a `/health` route:

```typescript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

---

## 🎯 Next Steps

### For External Database (Default):
1. Ensure your `.env` file is configured with your `DATABASE_URL`
2. Run `docker-compose up -d`
3. Test the API at `http://localhost:5000/api`
4. Monitor logs with `docker-compose logs -f app`

### For Local Docker Database:
1. Create `.env.local` from `.env.docker.example`
2. Configure database credentials and secrets
3. Run `docker-compose -f docker-compose.local-db.yml up -d`
4. Test the API at `http://localhost:5000/api`
5. Access pgAdmin at `http://localhost:5050`
6. Monitor logs with `docker-compose -f docker-compose.local-db.yml logs -f`

For production deployment, review the security checklist and configure SSL/TLS.
