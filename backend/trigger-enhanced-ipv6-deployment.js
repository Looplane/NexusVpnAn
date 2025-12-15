/**
 * 🚀 Enhanced IPv6 Deployment Trigger
 * 
 * This script triggers a deployment with the enhanced IPv6 fallback configuration
 * and handles the ENETUNREACH error through intelligent connection management
 */

const axios = require('axios');

// Render API Configuration
const RENDER_API_KEY = process.env.RENDER_API_KEY || 'rnd_muiSPn8g8DkE8Z0lEBFGYjvXvTTd'; // Replace with your actual key
const SERVICE_ID = 'srv-d4vjm2muk2gs739fgqi0';
const RENDER_API_URL = 'https://api.render.com/v1/services';

/**
 * Trigger deployment with enhanced IPv6 configuration
 */
async function triggerEnhancedIPv6Deployment() {
  console.log('🚀 Triggering Enhanced IPv6 Deployment...');
  
  try {
    // Step 1: Clear build cache for fresh deployment
    console.log('🧹 Clearing build cache...');
    await clearBuildCache();
    
    // Step 2: Update environment variables for IPv6 fallback
    console.log('🔧 Updating environment variables...');
    await updateEnvironmentVariables();
    
    // Step 3: Trigger deployment with clear cache
    console.log('🚀 Triggering deployment...');
    const deployment = await triggerDeployment();
    
    console.log('✅ Enhanced IPv6 deployment triggered successfully!');
    console.log(`📊 Deployment ID: ${deployment.id}`);
    console.log(`🔗 Status: ${deployment.status}`);
    console.log(`🕐 Started: ${deployment.createdAt}`);
    
    return deployment;
    
  } catch (error) {
    console.error('❌ Enhanced IPv6 deployment failed:', error.message);
    throw error;
  }
}

/**
 * Clear build cache
 */
async function clearBuildCache() {
  try {
    const response = await axios.post(
      `${RENDER_API_URL}/${SERVICE_ID}/clear-build-cache`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${RENDER_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('✅ Build cache cleared successfully');
    return response.data;
    
  } catch (error) {
    console.error('⚠️ Build cache clear failed (continuing anyway):', error.response?.data || error.message);
    // Continue even if cache clear fails
  }
}

/**
 * Update environment variables for IPv6 fallback
 */
async function updateEnvironmentVariables() {
  const envVars = [
    {
      key: 'NODE_ENV',
      value: 'production'
    },
    {
      key: 'DATABASE_RETRY_ATTEMPTS',
      value: '15'
    },
    {
      key: 'DATABASE_CONNECTION_TIMEOUT',
      value: '60000'
    },
    {
      key: 'DATABASE_KEEP_ALIVE',
      value: 'true'
    },
    {
      key: 'DATABASE_IPV6_FALLBACK',
      value: 'true'
    },
    {
      key: 'DATABASE_POOL_MAX',
      value: '3'
    },
    {
      key: 'DATABASE_POOL_IDLE_TIMEOUT',
      value: '30000'
    }
  ];
  
  try {
    // Update each environment variable
    for (const envVar of envVars) {
      await updateEnvironmentVariable(envVar.key, envVar.value);
    }
    
    console.log('✅ Environment variables updated for IPv6 fallback');
    
  } catch (error) {
    console.error('❌ Environment variable update failed:', error.message);
    throw error;
  }
}

/**
 * Update single environment variable
 */
async function updateEnvironmentVariable(key, value) {
  try {
    const response = await axios.put(
      `${RENDER_API_URL}/${SERVICE_ID}/env-vars/${key}`,
      { value },
      {
        headers: {
          'Authorization': `Bearer ${RENDER_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log(`✅ Updated ${key} = ${value}`);
    return response.data;
    
  } catch (error) {
    // If update fails, try creating the variable
    try {
      const response = await axios.post(
        `${RENDER_API_URL}/${SERVICE_ID}/env-vars`,
        { key, value },
        {
          headers: {
            'Authorization': `Bearer ${RENDER_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      console.log(`✅ Created ${key} = ${value}`);
      return response.data;
      
    } catch (createError) {
      console.error(`⚠️ Failed to update/create ${key}:`, createError.response?.data || createError.message);
    }
  }
}

/**
 * Trigger deployment
 */
async function triggerDeployment() {
  try {
    const response = await axios.post(
      `${RENDER_API_URL}/${SERVICE_ID}/deploys`,
      {
        clearCache: true,
        branch: 'main'
      },
      {
        headers: {
          'Authorization': `Bearer ${RENDER_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Deployment trigger failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Monitor deployment progress
 */
async function monitorDeployment(deploymentId) {
  console.log(`📊 Monitoring deployment ${deploymentId}...`);
  
  const maxWaitTime = 600000; // 10 minutes
  const checkInterval = 30000; // 30 seconds
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const response = await axios.get(
        `${RENDER_API_URL}/${SERVICE_ID}/deploys/${deploymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${RENDER_API_KEY}`,
            'Accept': 'application/json'
          }
        }
      );
      
      const deployment = response.data;
      console.log(`🔄 Status: ${deployment.status}`);
      
      if (deployment.status === 'live') {
        console.log('✅ Deployment completed successfully!');
        return deployment;
      }
      
      if (deployment.status === 'failed' || deployment.status === 'canceled') {
        throw new Error(`Deployment ${deployment.status}: ${deployment.message || 'Unknown error'}`);
      }
      
      console.log(`Waiting ${checkInterval/1000} seconds before next check...`);
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      
    } catch (error) {
      console.error('❌ Deployment monitoring error:', error.message);
      throw error;
    }
  }
  
  throw new Error('Deployment monitoring timeout');
}

/**
 * Main execution function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('🚀 ENHANCED IPv6 FALLBACK DEPLOYMENT');
  console.log('='.repeat(60));
  console.log(`🕐 Started: ${new Date().toISOString()}`);
  console.log(`🎯 Service: ${SERVICE_ID}`);
  console.log('');
  
  try {
    // Trigger enhanced deployment
    const deployment = await triggerEnhancedIPv6Deployment();
    
    // Monitor deployment progress
    console.log('');
    console.log('📊 Starting deployment monitoring...');
    await monitorDeployment(deployment.id);
    
    console.log('');
    console.log('🎉 ENHANCED IPv6 DEPLOYMENT COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('');
    console.error('💥 ENHANCED IPv6 DEPLOYMENT FAILED:');
    console.error(error.message);
    console.error('='.repeat(60));
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { triggerEnhancedIPv6Deployment };