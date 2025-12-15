# PostgreSQL Server Setup Guide for NexusVPN

## 🔧 Required PostgreSQL Server Configuration

Your PostgreSQL server at 91.99.23.239 needs to be configured to accept connections from your current IP address (39.39.209.207). Here's what needs to be done:

### 1. Edit PostgreSQL Configuration Files

You need to SSH into your server and modify these files:

#### A. Edit `postgresql.conf`
```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```

Add or modify these lines:
```
# Listen on all interfaces
listen_addresses = '*'

# Connection settings
max_connections = 100
shared_buffers = 128MB
```

#### B. Edit `pg_hba.conf`
```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Add this line for your IP address:
```
# Allow connections from your current IP
host    nexusvpn    postgres    39.39.209.207/32    md5

# Or allow from any IP (less secure)
host    nexusvpn    postgres    0.0.0.0/0           md5
```

### 2. Restart PostgreSQL Service
```bash
sudo systemctl restart postgresql
# or
sudo service postgresql restart
```

### 3. Create Database and User (if needed)
```bash
sudo -u postgres psql
```

In PostgreSQL prompt:
```sql
-- Create database
CREATE DATABASE nexusvpn;

-- Create user with password
CREATE USER nexusvpn WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE nexusvpn TO nexusvpn;

-- Exit
\q
```

### 4. Test Connection

After configuration, test with:
```bash
# From your local machine
psql -h 91.99.23.239 -U postgres -d nexusvpn
```

## 🚀 Quick Setup Script

Here's a script you can run on your PostgreSQL server:

```bash
#!/bin/bash
# PostgreSQL setup script for NexusVPN

echo "🔧 Setting up PostgreSQL for NexusVPN..."

# Backup original files
cp /etc/postgresql/*/main/postgresql.conf /etc/postgresql/*/main/postgresql.conf.backup
cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup

# Update postgresql.conf
echo "listen_addresses = '*'" >> /etc/postgresql/*/main/postgresql.conf
echo "max_connections = 100" >> /etc/postgresql/*/main/postgresql.conf

# Update pg_hba.conf
echo "host    nexusvpn    postgres    0.0.0.0/0    md5" >> /etc/postgresql/*/main/pg_hba.conf

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE nexusvpn;
CREATE USER nexusvpn WITH PASSWORD 'nexusvpn_secure_2024';
GRANT ALL PRIVILEGES ON DATABASE nexusvpn TO nexusvpn;
EOF

# Restart PostgreSQL
sudo systemctl restart postgresql

echo "✅ PostgreSQL setup complete!"
echo "📋 Database: nexusvpn"
echo "👤 User: nexusvpn"
echo "🔑 Password: nexusvpn_secure_2024"
echo "🌐 Allowed from: Any IP"
```

## 🔒 Security Recommendations

1. **Use specific IP ranges** instead of `0.0.0.0/0`
2. **Set strong passwords** for database users
3. **Consider SSL/TLS** for production (we'll configure this later)
4. **Monitor connection logs** for unauthorized access attempts
5. **Use firewall rules** to restrict access to port 5432

## 📝 Environment Variables

Once your server is configured, update these environment variables:

```bash
YOUR_DB_HOST=91.99.23.239
YOUR_DB_PORT=5432
YOUR_DB_USER=nexusvpn
YOUR_DB_PASSWORD=nexusvpn_secure_2024
YOUR_DB_NAME=nexusvpn
YOUR_DB_SSL=false
```

## 🧪 Test Again

After configuring your server, run the test script:
```bash
cd g:\VPN-PROJECT-2025\nexusvpn\backend
node test-your-postgres-connection.js
```

## 🆘 Troubleshooting

If connection still fails:

1. **Check PostgreSQL status**: `sudo systemctl status postgresql`
2. **Check logs**: `sudo tail -f /var/log/postgresql/postgresql-*.log`
3. **Check firewall**: `sudo ufw status` or `sudo iptables -L`
4. **Test locally**: `psql -U postgres -d nexusvpn`
5. **Check port binding**: `sudo netstat -tlnp | grep 5432`

Need help? Run these commands on your server and share the output.