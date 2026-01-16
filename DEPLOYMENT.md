# 🚀 Deployment Guide

Complete guide for deploying all portfolio projects to production.

## 📋 Table of Contents

1. [Frontend Projects](#frontend-projects)
2. [Backend APIs](#backend-apis)
3. [Database Setup](#database-setup)
4. [Environment Variables](#environment-variables)
5. [Production Checklist](#production-checklist)

---

## 🎨 Frontend Projects

### Portfolio Website (Static)

**Deployment Options:**

#### Option 1: GitHub Pages (Recommended)
```bash
# 1. Create repository: yourusername.github.io
# 2. Push portfolio-website contents to root
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/yourusername/yourusername.github.io.git
git push -u origin main

# Live at: https://yourusername.github.io
```

#### Option 2: Netlify
1. Drag and drop `portfolio-website` folder to Netlify
2. Or connect GitHub repository
3. Build settings: None (static site)
4. Publish directory: `portfolio-website`

#### Option 3: Vercel
```bash
cd portfolio-website
vercel
```

---

### JavaScript To-Do App

Same deployment as portfolio website. Can be deployed as:
- Subdirectory: `yourusername.github.io/todo-app`
- Separate domain: `todo.yourdomain.com`

---

### React Applications (React To-Do, Student Management)

**Build for Production:**
```bash
cd react-todo-app  # or student-management-system
npm run build
```

**Deployment Options:**

#### Option 1: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd react-todo-app
npm run build
netlify deploy --prod --dir=build
```

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Option 2: Vercel
```bash
cd react-todo-app
vercel
```

#### Option 3: GitHub Pages
```bash
# Add to package.json
"homepage": "https://yourusername.github.io/react-todo-app",

# Install gh-pages
npm install --save-dev gh-pages

# Add scripts
"predeploy": "npm run build",
"deploy": "gh-pages -d build"

# Deploy
npm run deploy
```

---

## 🔧 Backend APIs

### Student API & Auth API

**Deployment Options:**

#### Option 1: Heroku (Recommended for beginners)

**Setup:**
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
cd student-api
heroku create your-student-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_production_secret

# Deploy
git init
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Run database migrations
heroku pg:psql < config/database.sql
```

**Procfile:**
```
web: node server.js
```

---

#### Option 2: Railway

1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add PostgreSQL database
4. Set environment variables
5. Deploy automatically on push

**Environment Variables:**
```
NODE_ENV=production
PORT=5000
DB_HOST=<railway-db-host>
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=<railway-db-password>
JWT_SECRET=<your-secret>
CLIENT_URL=https://your-frontend.netlify.app
```

---

#### Option 3: DigitalOcean App Platform

1. Create new app from GitHub
2. Add PostgreSQL database
3. Configure environment variables
4. Set build command: `npm install`
5. Set run command: `npm start`

---

#### Option 4: AWS EC2 (Advanced)

**Setup:**
```bash
# 1. Launch EC2 instance (Ubuntu)
# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# 5. Clone repository
git clone https://github.com/yourusername/student-api.git
cd student-api
npm install

# 6. Setup PM2 for process management
sudo npm install -g pm2
pm2 start server.js --name student-api
pm2 startup
pm2 save

# 7. Setup Nginx reverse proxy
sudo apt-get install nginx
# Configure nginx to proxy to localhost:5000
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🗄️ Database Setup

### PostgreSQL Production Setup

#### Option 1: Heroku Postgres
```bash
# Automatically provisioned with Heroku
heroku addons:create heroku-postgresql:mini

# Get connection string
heroku config:get DATABASE_URL

# Run migrations
heroku pg:psql < config/database.sql
```

#### Option 2: Railway Postgres
- Automatically provisioned
- Connection details in dashboard
- Use provided connection string

#### Option 3: AWS RDS
1. Create RDS PostgreSQL instance
2. Configure security groups
3. Get connection endpoint
4. Update environment variables

#### Option 4: DigitalOcean Managed Database
1. Create PostgreSQL cluster
2. Add trusted sources
3. Get connection details
4. Update environment variables

---

## 🔐 Environment Variables

### Frontend (.env for React apps)

```env
# React To-Do App
REACT_APP_API_URL=https://your-api.herokuapp.com

# Student Management System
REACT_APP_API_URL=https://your-student-api.herokuapp.com
```

### Backend APIs

**Student API:**
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
CLIENT_URL=https://your-frontend.netlify.app
```

**Auth API:**
```env
NODE_ENV=production
PORT=5001
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=auth_db
DB_USER=your-db-user
DB_PASSWORD=your-db-password
JWT_SECRET=your-super-secret-production-key-min-32-chars
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
CLIENT_URL=https://your-frontend.netlify.app
```

---

## ✅ Production Checklist

### Security

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for specific origins
- [ ] Set secure cookie flags
- [ ] Enable rate limiting
- [ ] Sanitize user inputs
- [ ] Use environment variables (never commit secrets)
- [ ] Enable Helmet.js security headers
- [ ] Set up database backups

### Performance

- [ ] Enable gzip compression
- [ ] Minify frontend assets
- [ ] Optimize images
- [ ] Use CDN for static assets
- [ ] Enable database connection pooling
- [ ] Add caching where appropriate
- [ ] Monitor API response times

### Monitoring

- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Monitor uptime (UptimeRobot, Pingdom)
- [ ] Track API usage
- [ ] Set up alerts for errors
- [ ] Monitor database performance

### Testing

- [ ] Test all API endpoints
- [ ] Test authentication flow
- [ ] Test error handling
- [ ] Test rate limiting
- [ ] Test CORS configuration
- [ ] Test on different devices
- [ ] Test with production data

### Documentation

- [ ] Update README with live URLs
- [ ] Document API endpoints
- [ ] Add deployment instructions
- [ ] Include troubleshooting guide
- [ ] Add screenshots/demos

---

## 🌐 Custom Domain Setup

### Frontend (Netlify/Vercel)

1. Buy domain (Namecheap, Google Domains)
2. Add custom domain in Netlify/Vercel dashboard
3. Update DNS records:
   ```
   Type: A
   Name: @
   Value: <netlify-ip>
   
   Type: CNAME
   Name: www
   Value: <your-site>.netlify.app
   ```
4. Enable HTTPS (automatic)

### Backend (Heroku)

1. Add custom domain in Heroku dashboard
2. Update DNS:
   ```
   Type: CNAME
   Name: api
   Value: <your-app>.herokuapp.com
   ```

---

## 🐳 Docker Deployment (Advanced)

### Dockerfile for Backend

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: ./student-api
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=student_db
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Deploy:**
```bash
docker-compose up -d
```

---

## 📊 Cost Estimates

### Free Tier Options

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Netlify | Yes | 100GB bandwidth/month |
| Vercel | Yes | 100GB bandwidth/month |
| Heroku | Yes (with credit card) | 1000 dyno hours/month |
| Railway | Yes | $5 credit/month |
| GitHub Pages | Yes | 100GB bandwidth/month |

### Paid Options (Monthly)

| Service | Cost | Features |
|---------|------|----------|
| Heroku Hobby | $7/dyno | Always on, custom domain |
| Railway Pro | $5-20 | Based on usage |
| DigitalOcean | $5-10 | Droplet + database |
| AWS | Variable | Pay as you go |

---

## 🔄 CI/CD Setup

### GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Netlify
      uses: netlify/actions/cli@master
      with:
        args: deploy --prod --dir=build
      env:
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

---

## 📝 Post-Deployment

1. **Test Everything:**
   - All pages load correctly
   - API endpoints respond
   - Authentication works
   - Database connections work

2. **Update Portfolio:**
   - Add live demo links
   - Update GitHub README
   - Add screenshots

3. **Monitor:**
   - Check error logs
   - Monitor performance
   - Track user analytics

4. **Maintain:**
   - Regular security updates
   - Database backups
   - Performance optimization

---

## 🆘 Troubleshooting

### Common Issues

**Issue:** API CORS errors  
**Solution:** Update CLIENT_URL in backend .env

**Issue:** Database connection failed  
**Solution:** Check DB credentials and whitelist IP

**Issue:** Build fails on deployment  
**Solution:** Check Node version compatibility

**Issue:** Environment variables not working  
**Solution:** Restart dyno/service after setting variables

---

## 📚 Resources

- [Heroku Documentation](https://devcenter.heroku.com/)
- [Netlify Documentation](https://docs.netlify.com/)
- [Railway Documentation](https://docs.railway.app/)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
- [AWS Documentation](https://docs.aws.amazon.com/)

---

**Last Updated:** January 2026  
**Status:** Production Ready
