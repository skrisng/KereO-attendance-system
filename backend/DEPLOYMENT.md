# Deployment Guide

Complete guide for deploying the Django backend to production.

## Pre-Deployment Checklist

- [ ] Set `DEBUG=False` in production
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set strong `SECRET_KEY`
- [ ] Configure static files
- [ ] Set up HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Set up CI/CD pipeline

---

## Option 1: Railway Deployment

Railway is the easiest way to deploy Django apps.

### Step 1: Prepare for Railway

Create `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python manage.py migrate && gunicorn attendance_system.wsgi:application",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Create `Procfile`:
```
web: gunicorn attendance_system.wsgi:application --bind 0.0.0.0:$PORT
release: python manage.py migrate
```

Update `requirements.txt`:
```
Django==5.0.2
djangorestframework==3.14.0
django-cors-headers==4.3.1
django-filter==24.1
Pillow==10.2.0
python-dotenv==1.0.1
google-generativeai==0.8.3
requests==2.31.0
gunicorn==21.2.0
psycopg2-binary==2.9.9
whitenoise==6.6.0
dj-database-url==2.1.0
```

### Step 2: Update Settings for Production

Add to `settings.py`:
```python
import dj_database_url

# Production settings
if not DEBUG:
    # Database
    DATABASES['default'] = dj_database_url.config(
        conn_max_age=600,
        conn_health_checks=True,
    )
    
    # Static files
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
    STATIC_ROOT = BASE_DIR / 'staticfiles'
    
    # Security
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
```

### Step 3: Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add

# Set environment variables
railway variables set DEBUG=False
railway variables set DJANGO_SECRET_KEY=your-secret-key
railway variables set API_KEY=your-gemini-key
railway variables set ALLOWED_HOSTS=your-domain.railway.app

# Deploy
railway up
```

### Step 4: Run Migrations

```bash
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

---

## Option 2: Heroku Deployment

### Step 1: Prepare for Heroku

Create `Procfile`:
```
web: gunicorn attendance_system.wsgi:application
release: python manage.py migrate
```

Create `runtime.txt`:
```
python-3.11.7
```

### Step 2: Install Heroku CLI

```bash
# Windows
choco install heroku-cli

# Mac
brew tap heroku/brew && brew install heroku

# Login
heroku login
```

### Step 3: Create Heroku App

```bash
# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set DEBUG=False
heroku config:set DJANGO_SECRET_KEY=your-secret-key
heroku config:set API_KEY=your-gemini-key
heroku config:set ALLOWED_HOSTS=your-app-name.herokuapp.com
```

### Step 4: Deploy

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Deploy
git push heroku main

# Run migrations
heroku run python manage.py migrate
heroku run python manage.py createsuperuser

# Open app
heroku open
```

---

## Option 3: AWS EC2 Deployment

### Step 1: Launch EC2 Instance

1. Launch Ubuntu 22.04 LTS instance
2. Configure security group:
   - SSH (22)
   - HTTP (80)
   - HTTPS (443)
3. Create and download key pair

### Step 2: Connect and Setup

```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install python3-pip python3-venv nginx postgresql postgresql-contrib -y

# Create project directory
mkdir ~/attendance-backend
cd ~/attendance-backend

# Clone your repository
git clone your-repo-url .

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn
```

### Step 3: Configure PostgreSQL

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE attendance_db;
CREATE USER attendance_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE attendance_db TO attendance_user;
\q

# Update .env
DATABASE_URL=postgresql://attendance_user:your-password@localhost/attendance_db
```

### Step 4: Configure Gunicorn

Create `/etc/systemd/system/gunicorn.service`:
```ini
[Unit]
Description=Gunicorn daemon for attendance system
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/attendance-backend
Environment="PATH=/home/ubuntu/attendance-backend/venv/bin"
ExecStart=/home/ubuntu/attendance-backend/venv/bin/gunicorn \
          --workers 3 \
          --bind unix:/home/ubuntu/attendance-backend/gunicorn.sock \
          attendance_system.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
# Start Gunicorn
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
```

### Step 5: Configure Nginx

Create `/etc/nginx/sites-available/attendance`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /home/ubuntu/attendance-backend;
    }

    location /media/ {
        root /home/ubuntu/attendance-backend;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/home/ubuntu/attendance-backend/gunicorn.sock;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/attendance /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## Option 4: Docker Deployment

### Step 1: Create Dockerfile

```dockerfile
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Run migrations and start server
CMD python manage.py migrate && \
    gunicorn attendance_system.wsgi:application --bind 0.0.0.0:8000
```

### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: attendance_db
      POSTGRES_USER: attendance_user
      POSTGRES_PASSWORD: your-password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  web:
    build: .
    command: gunicorn attendance_system.wsgi:application --bind 0.0.0.0:8000
    volumes:
      - .:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "8000:8000"
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://attendance_user:your-password@db:5432/attendance_db
      - DJANGO_SECRET_KEY=your-secret-key
      - API_KEY=your-gemini-key
    depends_on:
      - db

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    depends_on:
      - web

volumes:
  postgres_data:
  static_volume:
  media_volume:
```

### Step 3: Deploy

```bash
# Build and start
docker-compose up -d

# Run migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser
```

---

## Production Settings Checklist

### settings.py Updates

```python
import os
from pathlib import Path
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

# Database
if os.getenv('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(
            default=os.getenv('DATABASE_URL'),
            conn_max_age=600,
            conn_health_checks=True,
        )
    }

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# CORS
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ORIGINS', '').split(',')

# Security
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': True,
        },
    },
}
```

---

## Environment Variables

Required environment variables for production:

```bash
DEBUG=False
DJANGO_SECRET_KEY=your-very-long-random-secret-key
API_KEY=your-gemini-api-key
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DATABASE_URL=postgresql://user:password@host:5432/dbname
CORS_ORIGINS=https://your-frontend.com,https://www.your-frontend.com
```

---

## Monitoring & Logging

### Setup Sentry (Error Tracking)

```bash
pip install sentry-sdk
```

Add to `settings.py`:
```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

if not DEBUG:
    sentry_sdk.init(
        dsn=os.getenv('SENTRY_DSN'),
        integrations=[DjangoIntegration()],
        traces_sample_rate=1.0,
        send_default_pii=True
    )
```

### Setup Application Monitoring

Use services like:
- New Relic
- Datadog
- AWS CloudWatch

---

## Backup Strategy

### Database Backups

```bash
# Manual backup
pg_dump attendance_db > backup_$(date +%Y%m%d).sql

# Automated daily backups (cron)
0 2 * * * pg_dump attendance_db > /backups/backup_$(date +\%Y\%m\%d).sql
```

### Media Files Backup

```bash
# Sync to S3
aws s3 sync /path/to/media s3://your-bucket/media/
```

---

## Performance Optimization

1. **Enable caching** - Use Redis for caching
2. **Database indexing** - Add indexes to frequently queried fields
3. **CDN** - Use CloudFlare or AWS CloudFront for static files
4. **Connection pooling** - Use pgBouncer for PostgreSQL
5. **Async tasks** - Use Celery for background tasks

---

## Maintenance

### Regular Tasks

```bash
# Update dependencies
pip install --upgrade -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Clear old sessions
python manage.py clearsessions

# Clean old records
python manage.py cleanup_old_records --days=365
```

---

## Troubleshooting

### Common Issues

**Static files not loading:**
```bash
python manage.py collectstatic --noinput
```

**Database connection errors:**
- Check DATABASE_URL
- Verify PostgreSQL is running
- Check firewall rules

**CORS errors:**
- Update CORS_ALLOWED_ORIGINS
- Restart server

**502 Bad Gateway:**
- Check Gunicorn is running
- Check Nginx configuration
- Check application logs

---

## Support

For deployment issues:
1. Check application logs
2. Check server logs
3. Verify environment variables
4. Test database connection
5. Check firewall rules
