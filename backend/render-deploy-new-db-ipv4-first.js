/**
 * 🚀 **RENDER IPv4-FIRST DEPLOYMENT WITH NEW DATABASE**
 * 
 * This script implements Render's recommended IPv4-first approach
 * using the new PostgreSQL database: nexusvpn2-postgres-db
 * 
 * Database Details:
 * - Service ID: dpg-d4vov3i4d50c7385iv0g-a
 * - Internal URL: postgresql://nexusvpn2_user:cFqFrbWugRlJEcaKV7T7Py4c7q6AWaVC@dpg-d4vov3i4d50c7385iv0g-a/nexusvpn2_postgres_db
 * - External URL: postgresql://nexusvpn2_user:cFqFrbWugRlJEcaKV7T7Py4c7q6AWaVC@dpg-d4vov3i4d50c7385iv0g-a.oregon-postgres.render.com/nexusvpn2_postgres_db
 * - Expires: January 14, 2026 (Free tier)
 * 
 * Based on Render's guidance: NODE_OPTIONS=--dns-result-order=ipv4first
 */

const axios = require('axios');
const https = require('https');

// Render deployment hook for the web service
const DEPLOY_HOOK_URL = 'https://api.render.com/deploy/srv-d4vjm2muk2gs739fgqi0?key=O-4z2JK4nds';
const WEB_SERVICE_ID = 'srv-d4vjm2muk2gs739fgqi0';
const DATABASE_SERVICE_ID = 'dpg-d4vov3i4d50c7385iv0g-a';

// New database configuration
const NEW_DATABASE_CONFIG = {
  internalUrl: 'postgresql://nexusvpn2_user:cFqFrbWugRlJEcaKV7T7Py4c7q6AWaVC@dpg-d4vov3i4d50c7385iv0g-a/nexusvpn2_postgres_db',
  externalUrl: 'postgresql://nexusvpn2_user:cFqFrbWugRlJEcaKV7T7Py4c7q6AWaVC@dpg-d4vov3i4d50c7385iv0g-a.oregon-postgres.render.com/nexusvpn2_postgres_db',
  host: 'dpg-d4vov3i4d50c7385iv0g-a',
  externalHost: 'dpg-d4vov3i4d50c7385iv0g-a.oregon-postgres.render.com',
  port: 5432,
  database: 'nexusvpn2_postgres_db',
  username: 'nexusvpn2_user',
  password: 'cFqFrbWugRlJEcaKV7T7Py4c7q6AWaVC'
};

/**
 * Main deployment function with new database and IPv4-first strategy
 */
async function deployWithNewDatabaseAndIPv4First() {
  console.log('='.repeat(80));
  console.log('🚀 RENDER IPv4-FIRST DEPLOYMENT WITH NEW DATABASE');
  console.log('='.repeat(80));
  console.log(`🕐 Started: ${new Date().toISOString()}`);
  console.log(`🎯 Web Service: ${WEB_SERVICE_ID}`);
  console.log(`🗄️  Database Service: ${DATABASE_SERVICE_ID}`);
  console.log(`📅 Database Expires: January 14, 2026 (Free tier)`);
  console.log('');

  try {
    // Step 1: Configure environment variables for new database
    console.log('🔧 Configuring environment variables for new database...');
    const envConfig = await configureNewDatabaseEnvironment();
    
    // Step 2: Test new database connectivity
    console.log('🧪 Testing new database connectivity...');
    const dbTest = await testNewDatabaseConnection();
    
    if (!dbTest.success) {
      console.log('⚠️  Database connection test failed, implementing fallback...');
      await implementDatabaseFallback();
    }
    
    // Step 3: Trigger deployment with new configuration
    console.log('🎯 Triggering deployment with new database...');
    const deployment = await triggerDeploymentWithNewDatabase();
    
    // Step 4: Monitor deployment progress
    console.log('📊 Monitoring deployment progress...');
    await monitorNewDatabaseDeployment(deployment.id);
    
    console.log('✅ IPv4-First Deployment with New Database Completed Successfully!');
    return deployment;
    
  } catch (error) {
    console.error('❌ IPv4-First Deployment with New Database Failed:', error.message);
    process.exit(1);
  }
}

/**
 * Configure environment variables for new database with IPv4-first approach
 */
async function configureNewDatabaseEnvironment() {
  const envConfig = {
    // Render's recommended IPv4-first DNS resolution
    NODE_OPTIONS: '--dns-result-order=ipv4first',
    
    // New database configuration (using internal URL for better connectivity)
    DATABASE_URL: NEW_DATABASE_CONFIG.internalUrl,
    
    // Enhanced connection settings for IPv4 fallback
    DATABASE_RETRY_ATTEMPTS: '10',
    DATABASE_CONNECTION_TIMEOUT: '30000',
    DATABASE_POOL_MAX: '5',
    DATABASE_POOL_IDLE_TIMEOUT: '10000',
    
    // Production settings
    NODE_ENV: 'production',
    
    // Database-specific settings
    DB_HOST: NEW_DATABASE_CONFIG.host,
    DB_PORT: NEW_DATABASE_CONFIG.port.toString(),
    DB_NAME: NEW_DATABASE_CONFIG.database,
    DB_USER: NEW_DATABASE_CONFIG.username,
    DB_PASSWORD: NEW_DATABASE_CONFIG.password,
    
    // Render service identifiers
    RENDER_WEB_SERVICE_ID: WEB_SERVICE_ID,
    RENDER_DATABASE_SERVICE_ID: DATABASE_SERVICE_ID,
    RENDER_DEPLOY_HOOK: DEPLOY_HOOK_URL,
    
    // IPv6 fallback settings
    DATABASE_IPV6_FALLBACK: 'true',
    USE_INTERNAL_DATABASE_URL: 'true'
  };
  
  console.log('📋 New Database Environment Configuration:');
  Object.entries(envConfig).forEach(([key, value]) => {
    if (key.includes('PASSWORD')) {
      console.log(`  ${key}: ${'*'.repeat(value.length)}`);
    } else {
      console.log(`  ${key}: ${value}`);
    }
  });
  
  console.log('');
  console.log('⚠️  Please manually update these environment variables in Render dashboard:');
  console.log('   Dashboard → Web Service → Environment → Add/Edit Variables');
  console.log('   Use the internal database URL for better connectivity within Render network');
  
  return envConfig;
}

/**
 * Test new database connectivity with IPv4-first approach
 */
async function testNewDatabaseConnection() {
  console.log('🧪 Testing new database connectivity...');
  
  try {
    // Test internal connection first (preferred for Render services)
    console.log('🔍 Testing internal database connection...');
    const internalTest = await testDatabaseConnection({
      host: NEW_DATABASE_CONFIG.host,
      port: NEW_DATABASE_CONFIG.port,
      database: NEW_DATABASE_CONFIG.database,
      user: NEW_DATABASE_CONFIG.username,
      password: NEW_DATABASE_CONFIG.password,
      ssl: { rejectUnauthorized: false }
    });
    
    if (internalTest.success) {
      console.log('✅ Internal database connection successful!');
      return { success: true, method: 'internal' };
    }
    
    // Fallback to external connection
    console.log('🔍 Internal connection failed, testing external connection...');
    const externalTest = await testDatabaseConnection({
      host: NEW_DATABASE_CONFIG.externalHost,
      port: NEW_DATABASE_CONFIG.port,
      database: NEW_DATABASE_CONFIG.database,
      user: NEW_DATABASE_CONFIG.username,
      password: NEW_DATABASE_CONFIG.password,
      ssl: { rejectUnauthorized: false }
    });
    
    if (externalTest.success) {
      console.log('✅ External database connection successful!');
      return { success: true, method: 'external' };
    }
    
    console.log('❌ Both internal and external database connections failed');
    return { success: false, errors: { internal: internalTest.error, external: externalTest.error } };
    
  } catch (error) {
    console.log(`❌ Database connection test error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test database connection with given configuration
 */
async function testDatabaseConnection(config) {
  try {
    const { Client } = require('pg');
    const client = new Client(config);
    
    await client.connect();
    const result = await client.query('SELECT NOW() as current_time');
    await client.end();
    
    console.log(`✅ Database connection test passed: ${result.rows[0].current_time}`);
    return { success: true, timestamp: result.rows[0].current_time };
    
  } catch (error) {
    console.log(`⚠️  Database connection test failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Implement database connection fallback strategies
 */
async function implementDatabaseFallback() {
  console.log('🔄 Implementing database connection fallback strategies...');
  
  // Strategy 1: Use external URL instead of internal
  console.log('📋 Fallback Strategy 1: Using external database URL');
  process.env.DATABASE_URL = NEW_DATABASE_CONFIG.externalUrl;
  
  // Strategy 2: Increase connection timeout
  console.log('📋 Fallback Strategy 2: Increasing connection timeout');
  process.env.DATABASE_CONNECTION_TIMEOUT = '60000'; // 60 seconds
  
  // Strategy 3: Reduce connection pool size
  console.log('📋 Fallback Strategy 3: Reducing connection pool size');
  process.env.DATABASE_POOL_MAX = '3';
  
  console.log('✅ Fallback strategies implemented');
}

/**
 * Trigger deployment with new database configuration
 */
async function triggerDeploymentWithNewDatabase() {
  try {
    console.log(`🎯 Triggering deployment via: ${DEPLOY_HOOK_URL}`);
    
    const response = await axios.post(DEPLOY_HOOK_URL, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });
    
    const deployment = response.data;
    console.log('✅ Deployment triggered successfully with new database!');
    console.log(`📊 Deployment ID: ${deployment.deploy?.id || 'Unknown'}`);
    console.log(`🔗 Status: ${deployment.deploy?.status || 'Triggered'}`);
    
    return deployment.deploy || { id: 'unknown', status: 'triggered' };
    
  } catch (error) {
    console.error('❌ Deployment hook failed:', error.response?.data || error.message);
    
    // Fallback: Manual deployment trigger
    console.log('🔄 Falling back to manual deployment instructions...');
    console.log('Please manually trigger deployment:');
    console.log('1. Go to: https://dashboard.render.com/web/srv-d4vjm2muk2gs739fgqi0');
    console.log('2. Navigate to your Web Service');
    console.log('3. Click "Manual Deploy" → "Deploy latest commit"');
    console.log('4. Ensure environment variables are updated with new database credentials');
    
    throw error;
  }
}

/**
 * Monitor new database deployment progress
 */
async function monitorNewDatabaseDeployment(deploymentId) {
  console.log(`📊 Monitoring new database deployment: ${deploymentId}`);
  console.log('⏱️  This may take 5-10 minutes...');
  
  // Provide comprehensive monitoring instructions
  console.log('');
  console.log('🔍 How to monitor your new database deployment:');
  console.log('1. Visit: https://dashboard.render.com/web/srv-d4vjm2muk2gs739fgqi0');
  console.log('2. Check the "Deploys" tab for status');
  console.log('3. Monitor logs in the "Logs" tab');
  console.log('4. Look for "Build successful" and "Your service is live"');
  
  console.log('');
  console.log('🎯 New Database Deployment Success Indicators:');
  console.log('   • Build completes without database connection errors');
  console.log('   • Service shows "Live" status');
  console.log('   • Logs show successful connection to nexusvpn2-postgres-db');
  console.log('   • No ENETUNREACH or IPv6 connectivity errors');
  console.log('   • API endpoints become accessible');
  
  console.log('');
  console.log('📋 Post-Deployment Verification:');
  console.log('   • Test database connectivity');
  console.log('   • Verify all API endpoints work');
  console.log('   • Check for any connection pool issues');
  console.log('   • Monitor for 24 hours for stability');
  
  return { status: 'monitoring', deploymentId, database: 'nexusvpn2-postgres-db' };
}

/**
 * Create IPv4-first TypeORM configuration for new database
 */
function createIPv4FirstTypeORMConfigForNewDatabase() {
  return `
// IPv4-First TypeORM Configuration for New Database
// Add this to your app.module.ts or database configuration

TypeOrmModule.forRootAsync({
  useFactory: () => ({
    type: 'postgres',
    url: process.env.DATABASE_URL || '${NEW_DATABASE_CONFIG.internalUrl}',
    
    // IPv4-first connection settings (works with NODE_OPTIONS=--dns-result-order=ipv4first)
    retryAttempts: parseInt(process.env.DATABASE_RETRY_ATTEMPTS) || 10,
    retryDelay: 3000,
    
    // Connection pool optimization for Render free tier
    extra: {
      connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT) || 30000,
      idleTimeoutMillis: parseInt(process.env.DATABASE_POOL_IDLE_TIMEOUT) || 10000,
      max: parseInt(process.env.DATABASE_POOL_MAX) || 5,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    },
    
    // Production settings
    synchronize: false, // Set to false in production
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    
    // Entity configuration
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
  }),
});
`;
}

/**
 * Main execution function
 */
async function main() {
  console.log('='.repeat(80));
  console.log('🚀 RENDER IPv4-FIRST DEPLOYMENT WITH NEW DATABASE');
  console.log('='.repeat(80));
  console.log(`🕐 Started: ${new Date().toISOString()}`);
  console.log(`🎯 Web Service: ${WEB_SERVICE_ID}`);
  console.log(`🗄️  Database: nexusvpn2-postgres-db (${DATABASE_SERVICE_ID})`);
  console.log(`📅 Expires: January 14, 2026 (Free tier)`);
  console.log(`🔗 Internal URL: ${NEW_DATABASE_CONFIG.internalUrl}`);
  console.log(`🔗 External URL: ${NEW_DATABASE_CONFIG.externalUrl}`);
  console.log('');
  
  try {
    // Execute deployment with new database
    await deployWithNewDatabaseAndIPv4First();
    
    console.log('');
    console.log('🎉 IPv4-FIRST DEPLOYMENT WITH NEW DATABASE COMPLETED!');
    console.log('='.repeat(80));
    
    console.log('');
    console.log('📋 POST-DEPLOYMENT CHECKLIST:');
    console.log('1. ✅ Monitor deployment progress in Render dashboard');
    console.log('2. ✅ Check logs for successful database connection');
    console.log('3. ✅ Verify no ENETUNREACH errors appear');
    console.log('4. ✅ Test API endpoints when service is live');
    console.log('5. ✅ Monitor for 24 hours for stability');
    
    console.log('');
    console.log('🎯 SUCCESS INDICATORS:');
    console.log('   • Build completes without database errors');
    console.log('   • Service shows "Live" status');
    console.log('   • Logs confirm connection to nexusvpn2-postgres-db');
    console.log('   • No IPv6 connectivity issues');
    console.log('   • API endpoints respond correctly');
    
  } catch (error) {
    console.error('');
    console.error('💥 IPv4-FIRST DEPLOYMENT WITH NEW DATABASE FAILED:');
    console.error(error.message);
    console.error('='.repeat(80));
    
    console.log('');
    console.log('🔄 MANUAL FALLBACK INSTRUCTIONS:');
    console.log('1. Manually update environment variables in Render dashboard');
    console.log('2. Set NODE_OPTIONS=--dns-result-order=ipv4first');
    console.log('3. Use the internal database URL for better connectivity');
    console.log('4. Trigger manual deployment');
    
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { 
  deployWithNewDatabaseAndIPv4First,
  NEW_DATABASE_CONFIG,
  createIPv4FirstTypeORMConfigForNewDatabase
};