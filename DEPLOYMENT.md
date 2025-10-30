# Deployment Guide

## Linux Server Deployment

### System Requirements

- Ubuntu 20.04+ / CentOS 8+
- Python 3.10+
- Node.js 18+
- Nginx (optional)
- At least 2GB RAM

### 1. Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.10
sudo apt install python3.10 python3.10-venv python3-pip -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y
```

### 2. Clone Project

```bash
cd /opt
sudo git clone <your-repo-url> a101-ai-trader
cd a101-ai-trader
sudo chown -R $USER:$USER .
```

### 3. Deploy Backend

```bash
cd /opt/a101-ai-trader/backend

# Create virtual environment
python3.10 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
nano .env  # Edit configuration
```

**Create systemd service file:**

```bash
sudo nano /etc/systemd/system/a101-backend.service
```

Add the following content:

```ini
[Unit]
Description=A101 AI Trader Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/a101-ai-trader/backend
Environment="PATH=/opt/a101-ai-trader/backend/venv/bin"
ExecStart=/opt/a101-ai-trader/backend/venv/bin/python app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Start service:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable a101-backend
sudo systemctl start a101-backend
sudo systemctl status a101-backend
```

### 4. Deploy Frontend

```bash
cd /opt/a101-ai-trader/frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
nano .env.local  # Set NEXT_PUBLIC_API_URL

# Build production version
npm run build
```

**Create systemd service file:**

```bash
sudo nano /etc/systemd/system/a101-frontend.service
```

Add the following content:

```ini
[Unit]
Description=A101 AI Trader Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/a101-ai-trader/frontend
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Start service:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable a101-frontend
sudo systemctl start a101-frontend
sudo systemctl status a101-frontend
```

### 5. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/a101-ai-trader
```

Add the following configuration:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable site:**

```bash
sudo ln -s /etc/nginx/sites-available/a101-ai-trader /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Configure SSL (Using Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 7. Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

## Docker Deployment (Optional)

### Create Dockerfile (Backend)

```dockerfile
# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "app.py"]
```

### Create Dockerfile (Frontend)

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
```

### creat docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
```

### Deploy with Docker Compose

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Monitoring and Maintenance

### View Logs

```bash
# Backend logs
sudo journalctl -u a101-backend -f

# Frontend logs
sudo journalctl -u a101-frontend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Update Application

```bash
cd /opt/a101-ai-trader
git pull

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart a101-backend

# Update frontend
cd ../frontend
npm install
npm run build
sudo systemctl restart a101-frontend
```

### Backup

```bash
# Backup configuration files
sudo tar -czf a101-backup-$(date +%Y%m%d).tar.gz \
  /opt/a101-ai-trader/backend/.env \
  /opt/a101-ai-trader/frontend/.env.local

# Scheduled backup (add to crontab)
0 2 * * * /path/to/backup-script.sh
```

## Performance Optimization

### 1. Use Gunicorn (Backend)

```bash
pip install gunicorn

# Modify systemd service
ExecStart=/opt/a101-ai-trader/backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app --bind 0.0.0.0:8000
```

### 2. Enable Nginx Caching

Add to Nginx configuration:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

location /api/ {
    proxy_cache my_cache;
    proxy_cache_valid 200 5m;
    # ... other configuration
}
```

### 3. Enable Gzip Compression

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript;
```

## Troubleshooting

### Service Won't Start
```bash
# Check service status
sudo systemctl status a101-backend
sudo systemctl status a101-frontend

# View detailed logs
sudo journalctl -xe -u a101-backend
```

### Port Already in Use
```bash
# Check port usage
sudo netstat -tulpn | grep :8000
sudo netstat -tulpn | grep :3000

# Kill process
sudo kill -9 <PID>
```

### Permission Issues
```bash
# Fix permissions
sudo chown -R www-data:www-data /opt/a101-ai-trader
sudo chmod -R 755 /opt/a101-ai-trader
```
