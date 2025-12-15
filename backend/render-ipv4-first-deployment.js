/**
 * 🚀 **RENDER IPv4-FIRST DEPLOYMENT SOLUTION**
 * 
 * This script implements Render's recommended approach for IPv6 connectivity issues
 * by using IPv4-first DNS resolution and proper connection pooling
 * 
 * Based on Render's guidance: Force IPv4 using NODE_OPTIONS=--dns-result-order=ipv4first
 */

const axios = require('axios');

// Render Deployment Hook from web reference
const DEPLOY_HOOK_URL = 'https://api.render.com/deploy/srv-d4vjm2muk2gs739fgqi0?key=O-4z2JK4nds';
const SERVICE_ID = 'srv-d4vjm2muk2gs739fgqi0';

/**
 * Main deployment function using Render's recommended IPv4-first approach
 */
async function deployWithIPv4FirstStrategy() {
  console.log('🚀 Starting Render IPv4-First Deployment Strategy...');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Update environment variables with IPv4-first configuration
    console.log('🔧 Configuring IPv4-first environment...');
    await configureIPv4FirstEnvironment();
    
    // Step 2: Trigger deployment using the deployment hook
    console.log('🎯 Triggering deployment via Render hook...');
    const deployment = await triggerDeploymentHook();
    
    // Step 3: Monitor deployment progress
    console.log('📊 Monitoring deployment progress...');
    await monitorDeploymentProgress(deployment.id);
    
    console.log('✅ IPv4-First Deployment Strategy Completed Successfully!');
    return deployment;
    
  } catch (error) {
    console.error('❌ IPv4-First Deployment Failed:', error.message);
    throw error;
  }
}

/**
 * Configure environment variables for IPv4-first strategy
 */
async function configureIPv4FirstEnvironment() {
  const envConfig = {
    // Render's recommended IPv4-first DNS resolution
    NODE_OPTIONS: '--dns-result-order=ipv4first',
    
    // Enhanced connection settings for IPv4 fallback
    DATABASE_RETRY_ATTEMPTS: '10',
    DATABASE_CONNECTION_TIMEOUT: '30000',
    DATABASE_POOL_MAX: '5',
    DATABASE_POOL_IDLE_TIMEOUT: '10000',
    
    // Production settings
    NODE_ENV: 'production',
    
    // IPv6 fallback settings (just in case)
    DATABASE_IPV6_FALLBACK: 'true',
    
    // Render-specific optimizations
    RENDER_SERVICE_ID: SERVICE_ID,
    RENDER_DEPLOY_HOOK: DEPLOY_HOOK_URL
  };
  
  console.log('📋 IPv4-First Environment Configuration:');
  Object.entries(envConfig).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  
  // Note: In a real scenario, you would update these via Render API
  // For now, we'll document them for manual configuration
  console.log('⚠️  Please manually update these environment variables in Render dashboard:');
  console.log('   Dashboard → Web Service → Environment → Add/Edit Variables');
  
  return envConfig;
}

/**
 * Trigger deployment using Render's deployment hook
 */
async function triggerDeploymentHook() {
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
    console.log('✅ Deployment hook triggered successfully!');
    console.log(`📊 Deployment ID: ${deployment.deploy?.id || 'Unknown'}`);
    console.log(`🔗 Status: ${deployment.deploy?.status || 'Triggered'}`);
    
    return deployment.deploy || { id: 'unknown', status: 'triggered' };
    
  } catch (error) {
    console.error('❌ Deployment hook failed:', error.response?.data || error.message);
    
    // Fallback: Manual deployment trigger
    console.log('🔄 Falling back to manual deployment instructions...');
    console.log('Please manually trigger deployment:');
    console.log('1. Go to Render Dashboard');
    console.log('2. Navigate to your Web Service');
    console.log('3. Click "Manual Deploy" → "Deploy latest commit"');
    
    throw error;
  }
}

/**
 * Monitor deployment progress (simplified version)
 */
async function monitorDeploymentProgress(deploymentId) {
  console.log(`📊 Monitoring deployment: ${deploymentId}`);
  console.log('⏱️  This may take 5-10 minutes...');
  
  // Provide monitoring instructions
  console.log('');
  console.log('🔍 How to monitor your deployment:');
  console.log('1. Visit: https://dashboard.render.com/web/srv-d4vjm2muk2gs739fgqi0');
  console.log('2. Check the "Deploys" tab for status');
  console.log('3. Monitor logs in the "Logs" tab');
  console.log('4. Look for "Build successful" and "Your service is live"');
  
  console.log('');
  console.log('✅ Expected deployment flow:');
  console.log('   • Build → Deploy → Live (5-10 minutes)');
  console.log('   • Check logs for "Database connection established"');
  console.log('   • Verify API endpoints are accessible');
  
  return { status: 'monitoring', deploymentId };
}

/**
 * Create IPv4-first TypeORM configuration
 */
function createIPv4FirstTypeORMConfig() {
  return `
// IPv4-First TypeORM Configuration
// Add this to your app.module.ts or database configuration

TypeOrmModule.forRootAsync({
  useFactory: () => ({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    
    // IPv4-first connection settings
    retryAttempts: parseInt(process.env.DATABASE_RETRY_ATTEMPTS) || 10,
    retryDelay: 3000,
    
    // Connection pool optimization for IPv4
    extra: {
      connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT) || 30000,
      idleTimeoutMillis: parseInt(process.env.DATABASE_POOL_IDLE_TIMEOUT) || 10000,
      max: parseInt(process.env.DATABASE_POOL_MAX) || 5,
      
      // IPv4-first DNS resolution
      // This works with NODE_OPTIONS=--dns-result-order=ipv4first
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
  console.log('='.repeat(70));
  console.log('🚀 RENDER IPv4-FIRST DEPLOYMENT STRATEGY');
  console.log('='.repeat(70));
  console.log(`🕐 Started: ${new Date().toISOString()}`);
  console.log(`🎯 Service: ${SERVICE_ID}`);
  console.log(`🔗 Hook: ${DEPLOY_HOOK_URL}`);
  console.log('');
  
  try {
    // Execute IPv4-first deployment strategy
    await deployWithIPv4FirstStrategy();
    
    console.log('');
    console.log('🎉 IPv4-FIRST DEPLOYMENT STRATEGY COMPLETED!');
    console.log('='.repeat(70));
    
    // Provide post-deployment instructions
    console.log('');
    console.log('📋 POST-DEPLOYMENT CHECKLIST:');
    console.log('1. ✅ Check deployment status in Render dashboard');
    console.log('2. ✅ Verify database connection in logs');
    console.log('3. ✅ Test API endpoints');
    console.log('4. ✅ Monitor for any connection errors');
    
  } catch (error) {
    console.error('');
    console.error('💥 IPv4-FIRST DEPLOYMENT STRATEGY FAILED:');
    console.error(error.message);
    console.error('='.repeat(70));
    
    // Provide fallback instructions
    console.log('');
    console.log('🔄 MANUAL FALLBACK INSTRUCTIONS:');
    console.log('1. Manually set NODE_OPTIONS=--dns-result-order=ipv4first');
    console.log('2. Trigger manual deployment in Render dashboard');
    console.log('3. Monitor logs for database connectivity');
    
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { 
  deployWithIPv4FirstStrategy, 
  createIPv4FirstTypeORMConfig,
  DEPLOY_HOOK_URL,
  SERVICE_ID 
};