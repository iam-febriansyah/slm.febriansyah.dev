# ERP Invoicing System - Docker Deployment

Dokumentasi lengkap untuk deployment aplikasi ERP Invoicing menggunakan Docker dan Docker Compose.

## 📋 Prerequisites

- Docker (versi 20.10 atau lebih baru)
- Docker Compose (versi 2.0 atau lebih baru)
- Git Bash / WSL (untuk Windows)
- Minimal 2GB RAM dan 10GB disk space

## 🚀 Quick Start

### 1. Setup Environment Variables

```bash
# Copy file environment example
cp .env.example .env

# Edit .env sesuai kebutuhan
nano .env  # atau gunakan text editor favorit
```

**⚠️ PENTING:** Ganti nilai `JWT_SECRET` dan `REFRESH_TOKEN_SECRET` dengan nilai yang aman untuk production!

### 2. Deploy Aplikasi

```bash
# Berikan permission execute pada script
chmod +x deploy.sh

# Jalankan full deployment
./deploy.sh deploy
```

Tunggu beberapa menit hingga proses build dan deployment selesai.

### 3. Akses Aplikasi

- **Frontend:** http://localhost:3003
- **Backend API:** http://localhost:3004
- **API Documentation:** http://localhost:3004/api

## 📖 Panduan Penggunaan Script

### Perintah Dasar

```bash
# Full deployment (build + start)
./deploy.sh deploy

# Build image saja
./deploy.sh build

# Start containers
./deploy.sh start

# Stop containers
./deploy.sh stop

# Restart containers
./deploy.sh restart

# Lihat status containers
./deploy.sh status
```

### Melihat Logs

```bash
# Semua logs
./deploy.sh logs

# Backend logs saja
./deploy.sh logs backend

# Frontend logs saja
./deploy.sh logs frontend

# Database logs saja
./deploy.sh logs mysql
```

### Maintenance

```bash
# Cleanup unused Docker resources
./deploy.sh cleanup

# Remove all (termasuk data) - DESTRUCTIVE!
./deploy.sh remove
```

## 🔧 Konfigurasi Environment Variables

### Backend Configuration
| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `BACKEND_PORT` | 3004 | Backend port |
| `JWT_SECRET` | (required) | JWT secret key |
| `JWT_EXPIRES_IN` | 7d | JWT expiration time |
| `REFRESH_TOKEN_SECRET` | (required) | Refresh token secret |
| `REFRESH_TOKEN_EXPIRES_IN` | 30d | Refresh token expiration |

### Frontend Configuration
| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `FRONTEND_PORT` | 3003 | Frontend port |
| `NEXT_PUBLIC_API_URL` | http://localhost:3004/api/v1 | Backend API URL |

### Database Configuration
Database credentials disimpan di `backend/.env`:
- `DATABASE_URL` - MySQL connection string
- Format: `mysql://user:password@host:port/database`

**Note:** MySQL sudah ada di server, tidak perlu di-containerize.

## 🏗️ Arsitektur Container

```
┌─────────────────────────────────────────────┐
│          Frontend (Next.js)                 │
│          Port: 3003                         │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│          Backend (NestJS)                   │
│          Port: 3004                         │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│          MySQL Database (External)          │
│          Sudah ada di server                │
└─────────────────────────────────────────────┘
```

**Note:** MySQL database tidak di-containerize karena sudah ada di server. 
Credentials database dibaca dari `backend/.env`.

## 🔍 Troubleshooting

### Container tidak mau start

```bash
# Cek logs untuk error
./deploy.sh logs

# Cek status semua containers
./deploy.sh status

# Restart containers
./deploy.sh restart
```

### Database connection error

1. Pastikan MySQL container sudah running
2. Cek DATABASE_URL di .env sudah benar
3. Tunggu beberapa detik untuk database initialization

```bash
# Cek database logs
./deploy.sh logs mysql
```

### Port sudah digunakan

Jika ada error port already in use:

1. Edit `.env` dan ganti port yang conflict
2. Atau stop aplikasi yang menggunakan port tersebut
3. Restart deployment

### Build error

```bash
# Clean build dan rebuild
./deploy.sh stop
./deploy.sh cleanup
./deploy.sh build
./deploy.sh start
```

## 🔐 Production Deployment

### Security Checklist

- [ ] Ganti `JWT_SECRET` dengan nilai random yang kuat
- [ ] Ganti `REFRESH_TOKEN_SECRET` dengan nilai random yang kuat
- [ ] Ganti `DB_PASSWORD` dengan password yang kuat
- [ ] Set `NODE_ENV=production` di environment variables
- [ ] Gunakan HTTPS dengan reverse proxy (Nginx/Caddy)
- [ ] Aktifkan firewall dan batas hanya port yang diperlukan
- [ ] Regular backup database
- [ ] Monitor logs dan metrics

### Menggunakan Reverse Proxy

Untuk production, disarankan menggunakan reverse proxy seperti Nginx:

```nginx
# /etc/nginx/sites-available/erp-invoicing
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoring

### Health Checks

Setiap container memiliki health check built-in:

```bash
# Cek health status
docker-compose ps

# Manual health check
curl http://localhost:4000/api/v1/health  # Backend
curl http://localhost:3000                 # Frontend
```

### Database Backup

```bash
# Backup database
docker exec erp-mysql mysqldump -u erp_user -p erp_invoicing > backup.sql

# Restore database
docker exec -i erp-mysql mysql -u erp_user -p erp_invoicing < backup.sql
```

## 🆘 Support

Jika menemukan masalah:

1. Cek logs: `./deploy.sh logs`
2. Cek status: `./deploy.sh status`
3. Review environment variables di `.env`
4. Pastikan Docker dan Docker Compose versi terbaru

## 📝 Update Log

- **2026-06-03**: Initial Docker deployment setup
  - Multi-stage Dockerfile untuk optimasi build
  - Docker Compose dengan health checks
  - Deploy script dengan color output dan error handling
  - Production-ready configuration

---

🎉 **Happy Deploying!**
