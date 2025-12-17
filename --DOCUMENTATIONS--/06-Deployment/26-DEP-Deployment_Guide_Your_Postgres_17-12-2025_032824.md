# 🚀 NexusVPN Deployment with Your PostgreSQL Server

**Document ID:** DEP-POSTGRES-001  
**Created:** 17-12-2025 | Time: 03:28:24  
**Last Updated:** 17-12-2025 | Time: 03:28:24  
**Agent:** `backend-nexusvpn-specialist` (Backend Specialist Agent)  
**Status:** ✅ Active

**Related Documents:**
- @--DOCUMENTATIONS--/06-Deployment/33-DEP-PostgreSQL_Integration_Complete_17-12-2025_032824.md (1-174)
- @--DOCUMENTATIONS--/07-Setup/27-SET-Supabase_Setup_17-12-2025_032824.md (1-53)

---

## 📋 Overview

This guide walks you through deploying NexusVPN to Render while using your PostgreSQL server at `91.99.23.239:5432` for the database.

## 🔧 Prerequisites

1. ✅ PostgreSQL server running at 91.99.23.239:5432
2. ✅ Port 5432 accessible from external connections
3. ✅ Render account with deploy hook access
4. ✅ Node.js and npm installed locally

## 🗄️ Step 1: Configure Your PostgreSQL Server

### Option A: Automated Setup (Recommended)

1. SSH into your PostgreSQL server:
   ```bash
   ssh your-user@91.99.23.239
   ```

2. Download and run the setup script:
   ```bash
   wget https://raw.githubusercontent.com/your-repo/nexusvpn/main/backend/setup-postgresql-server.sh
   chmod +x setup-postgresql-server.sh
   sudo ./setup-postgresql-server.sh
   ```

### Option B: Manual Configuration

1. **Edit postgresql.conf**:
   ```bash
   sudo nano /etc/postgresql/*/main/postgresql.conf
   ```
   Add:
   ```
   listen_addresses = '*'
   max_connections = 100
   ```

2. **Edit pg_hba.conf**:
   ```bash
   sudo nano /etc/postgresql/*/main/pg_hba.conf
   ```
   Add:
   ```
   host    nexusvpn    nexusvpn    0.0.0.0/0    md5
   ```

3. **Restart PostgreSQL**:
   ```bash
   sudo systemctl restart postgresql
   ```

4. **Create database and user**:
   ```bash
   sudo -u postgres psql
   ```
   ```sql
   CREATE DATABASE nexusvpn;
   CREATE USER nexusvpn WITH PASSWORD 'nexusvpn_secure_2024';
   GRANT ALL PRIVILEGES ON DATABASE nexusvpn TO nexusvpn;
   \q
   ```

## 🧪 Step 2: Test Database Connection

1. **Update environment variables**:
   ```bash
   cd g:\VPN-PROJECT-2025\nexusvpn\backend
   copy .env.your-postgres .env
   ```

2. **Edit .env file** with your actual credentials:
   ```
   YOUR_DB_HOST=91.99.23.239
   YOUR_DB_PORT=5432
   YOUR_DB_USER=nexusvpn
   YOUR_DB_PASSWORD=your_actual_password
   YOUR_DB_NAME=nexusvpn
   YOUR_DB_SSL=false
   USE_YOUR_POSTGRES=true
   ```

3. **Test connection**:
   ```bash
   node test-your-postgres-connection.js
   ```

## 🚀 Step 3: Deploy to Render

### Option A: Automated Deployment

1. **Run deployment script**:
   ```bash
   node deploy-with-your-postgres.js
   ```

2. **Follow prompts** to set environment variables

### Option B: Manual Deployment

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Navigate to your web service**: `srv-d4vjm2muk2gs739fgqi0`

3. **Set Environment Variables**:
   ```
   YOUR_DB_HOST=91.99.23.239
   YOUR_DB_PORT=5432
   YOUR_DB_USER=nexusvpn
   YOUR_DB_PASSWORD=your_actual_password
   YOUR_DB_NAME=nexusvpn
   YOUR_DB_SSL=false
   USE_YOUR_POSTGRES=true
   NODE_ENV=production
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=7d
   ```

4. **Trigger deployment**:
   ```bash
   curl -X POST "https://api.render.com/deploy/srv-d4vjm2muk2gs739fgqi0?key=O-4z2JK4nds"
   ```

## 🔍 Step 4: Verify Deployment

1. **Check deployment logs** in Render dashboard
2. **Test API endpoints** once deployed
3. **Verify database connection** in application logs

## 🛠️ Troubleshooting

### Database Connection Issues

1. **Check PostgreSQL logs**:
   ```bash
   sudo tail -f /var/log/postgresql/postgresql-*.log
   ```

2. **Test connection manually**:
   ```bash
   psql -h 91.99.23.239 -U nexusvpn -d nexusvpn
   ```

3. **Check firewall**:
   ```bash
   sudo ufw status
   sudo iptables -L
   ```

### Render Deployment Issues

1. **Check deployment logs** in Render dashboard
2. **Verify environment variables** are set correctly
3. **Test locally first**:
   ```bash
   cd g:\VPN-PROJECT-2025\nexusvpn\backend
   npm install
   npm run build
   npm run start:dev
   ```

## 🔒 Security Considerations

1. **Restrict IP access** in pg_hba.conf to only necessary IPs
2. **Use strong passwords** for database users
3. **Consider SSL/TLS** for production (we can help set this up)
4. **Monitor connection logs** for unauthorized access
5. **Regular backups** of your database

## 📊 Performance Optimization

1. **Connection pooling**: Already configured in the application
2. **Database indexes**: Will be created automatically
3. **Query optimization**: Application uses optimized queries
4. **Caching**: Redis can be added later if needed

## 🔄 Switching Back to Render Database

If you need to switch back to Render's PostgreSQL:

1. **Remove or set** `USE_YOUR_POSTGRES=false`
2. **Set** `DATABASE_URL` with Render's connection string
3. **Trigger deployment** again

## 📞 Support

If you encounter issues:

1. **Check logs** on both PostgreSQL server and Render
2. **Test connection** using provided scripts
3. **Verify configuration** matches this guide
4. **Contact support** with specific error messages

## 📁 Files Created

- `your-postgres-config.service.ts` - Database configuration
- `test-your-postgres-connection.js` - Connection test script
- `deploy-with-your-postgres.js` - Deployment script
- `setup-postgresql-server.sh` - Server setup script
- `.env.your-postgres` - Environment variables template

---

**🎯 Next Steps**: Once your PostgreSQL server is configured and tested, proceed with the deployment to Render using the provided scripts.

**Last Updated:** 17-12-2025 | Time: 03:28:24

