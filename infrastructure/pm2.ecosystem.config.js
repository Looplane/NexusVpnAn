// =============================================================================
// PM2 Ecosystem Configuration for Production
// =============================================================================
// Run with: pm2 start ecosystem.config.js
// =============================================================================

module.exports = {
  apps: [
    {
      name: 'nexusvpn-backend',
      script: './dist/main.js',
      cwd: '/opt/nexusvpn/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Auto-restart on crash
      autorestart: true,
      // Watch for file changes (disable in production)
      watch: false,
      // Max memory before restart
      max_memory_restart: '500M',
      // Logging
      error_file: '/var/log/nexusvpn/backend-error.log',
      out_file: '/var/log/nexusvpn/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Advanced settings
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
    },
  ],
};

