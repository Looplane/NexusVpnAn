/**
 * IPv6-Only Deployment Trigger for Render (Fixed Version)
 * Triggers deployment with corrected API payload format
 * 
 * Date: 2024-12-15
 * Purpose: Deploy NexusVPN backend with IPv6-compatible database configuration
 */

const https = require('https');

// Render service configuration
const RENDER_SERVICE_ID = 'srv-d4vjm2muk2gs739fgqi0';
const RENDER_API_KEY = process.env.RENDER_API_KEY;

/**
 * Trigger deployment with comprehensive error handling
 */
async function triggerIPv6Deployment() {
  console.log('🚀 Starting IPv6-Only Deployment Process...\n');
  
  // Validate API key
  if (!RENDER_API_KEY) {
    console.log('❌ RENDER_API_KEY environment variable is not set');
    console.log('💡 Please set your Render API key:');
    console.log('   export RENDER_API_KEY="your-render-api-key"');
    console.log('\n📝 To get your API key:');
    console.log('1. Go to https://dashboard.render.com/account/api-keys');
    console.log('2. Create a new API key');
    console.log('3. Copy the key and set it as environment variable');
    return;
  }
  
  console.log('✅ API key validated');
  console.log(`🎯 Target Service: ${RENDER_SERVICE_ID}`);
  
  try {
    console.log('\n📡 Sending deployment request to Render...');
    
    // Create deployment with correct payload format
    const deploymentData = {
      clearCache: "clear"  // Use "clear" instead of true/false as required by Render API
    };
    
    const response = await makeAPIRequest('POST', `/v1/services/${RENDER_SERVICE_ID}/deploys`, deploymentData);
    
    console.log('✅ Deployment triggered successfully!');
    console.log('\n📊 Deployment Details:');
    console.log(`   🆔 Deployment ID: ${response.id}`);
    console.log(`   📋 Status: ${response.status}`);
    console.log(`   🕐 Created At: ${response.createdAt}`);
    
    if (response.service?.serviceDetails?.url) {
      console.log(`   🌐 Service URL: ${response.service.serviceDetails.url}`);
    }
    
    // Monitor deployment progress
    console.log('\n⏳ Monitoring deployment progress...');
    await monitorDeployment(response.id);
    
  } catch (error) {
    console.log('\n❌ Deployment trigger failed!');
    console.log(`🚨 Error: ${error.message}`);
    
    if (error.message.includes('401')) {
      console.log('\n🔍 Authentication Error Analysis:');
      console.log('📝 Invalid API key or insufficient permissions');
      console.log('💡 Solution: Verify your API key is correct and has deploy permissions');
    }
    
    if (error.message.includes('404')) {
      console.log('\n🔍 Service Not Found Analysis:');
      console.log('📝 The service ID may be incorrect or service was deleted');
      console.log('💡 Solution: Verify the service ID in Render dashboard');
      console.log(`📍 Current Service ID: ${RENDER_SERVICE_ID}`);
    }
    
    if (error.message.includes('400')) {
      console.log('\n🔍 Bad Request Analysis:');
      console.log('📝 The request format may be incorrect');
      console.log('💡 Solution: Check API documentation for correct payload format');
    }
    
    console.log('\n💡 General Troubleshooting:');
    console.log('1. Verify your Render API key is correct');
    console.log('2. Check if the service exists in your Render dashboard');
    console.log('3. Ensure you have deploy permissions for this service');
    console.log('4. Check Render service status at https://status.render.com');
    console.log('5. Verify the service is not already deploying');
    
    process.exit(1);
  }
}

/**
 * Monitor deployment progress
 */
async function monitorDeployment(deployId) {
  const maxAttempts = 30; // 5 minutes of monitoring
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      console.log(`\n🔍 Checking deployment status (attempt ${attempts + 1}/${maxAttempts})...`);
      
      const deploy = await makeAPIRequest('GET', `/v1/deploys/${deployId}`);
      
      console.log(`📊 Current Status: ${deploy.status}`);
      
      if (deploy.status === 'live') {
        console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
        console.log('✅ Service is now live and running');
        
        if (deploy.service?.serviceDetails?.url) {
          console.log(`🌐 Live URL: ${deploy.service.serviceDetails.url}`);
          // Test service health
          await testServiceHealth(deploy.service.serviceDetails.url);
        }
        
        console.log(`📅 Deployed At: ${deploy.finishedAt}`);
        return;
      }
      
      if (deploy.status === 'build_failed' || deploy.status === 'update_failed') {
        console.log('\n❌ DEPLOYMENT FAILED!');
        console.log(`🚨 Failure Reason: ${deploy.failureReason || 'Unknown'}`);
        console.log('📋 Check Render dashboard for detailed logs');
        console.log(`🌐 Dashboard: https://dashboard.render.com/web/${RENDER_SERVICE_ID}`);
        process.exit(1);
      }
      
      if (deploy.status === 'canceled') {
        console.log('\n⚠️  DEPLOYMENT CANCELED!');
        console.log('📝 Deployment was manually canceled');
        process.exit(1);
      }
      
      // Show progress for different states
      switch (deploy.status) {
        case 'build_in_progress':
          console.log('🔨 Build in progress...');
          break;
        case 'update_in_progress':
          console.log('🔄 Update in progress...');
          break;
        case 'deactivated':
          console.log('💤 Service is deactivated');
          break;
        default:
          console.log(`⏳ Status: ${deploy.status}`);
      }
      
      attempts++;
      
      if (attempts < maxAttempts) {
        console.log('⏱️  Waiting 10 seconds before next check...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
      
    } catch (error) {
      console.log(`⚠️  Error monitoring deployment: ${error.message}`);
      console.log('⏱️  Waiting 10 seconds before retry...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      attempts++;
    }
  }
  
  console.log('\n⏰ Deployment monitoring timeout reached');
  console.log('📋 Check Render dashboard for final status');
  console.log(`🌐 Dashboard: https://dashboard.render.com/web/${RENDER_SERVICE_ID}`);
}

/**
 * Test service health after deployment
 */
async function testServiceHealth(serviceUrl) {
  if (!serviceUrl) {
    console.log('\n⚠️  No service URL provided, skipping health test');
    return;
  }
  
  console.log('\n🏥 Testing service health...');
  
  try {
    // Test health endpoint
    const healthUrl = serviceUrl.replace(/\/$/, '') + '/health';
    console.log(`🌐 Testing: ${healthUrl}`);
    
    const response = await makeHTTPRequest('GET', healthUrl);
    
    console.log('✅ Health check successful!');
    console.log(`📊 Response: ${response}`);
    
    // Try to parse JSON response
    try {
      const healthData = JSON.parse(response);
      console.log('📋 Health Status:');
      Object.keys(healthData).forEach(key => {
        console.log(`   ${key}: ${healthData[key]}`);
      });
    } catch {
      console.log(`📄 Raw Response: ${response}`);
    }
    
  } catch (error) {
    console.log(`⚠️  Health check failed: ${error.message}`);
    console.log('📋 This might be normal if the service is still starting up');
    console.log('⏳ Try again in a few minutes...');
  }
}

/**
 * Make authenticated API request to Render
 */
function makeAPIRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname: 'api.render.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${RENDER_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    if (method !== 'GET' && postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsedData = JSON.parse(responseData);
            resolve(parsedData);
          } catch (e) {
            resolve(responseData);
          }
        } else {
          reject(new Error(`API request failed with status ${res.statusCode}: ${responseData}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
    
    if (method !== 'GET' && postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

/**
 * Make simple HTTP request for health checks
 */
function makeHTTPRequest(method, url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      timeout: 10000 // 10 second timeout
    };
    
    const protocol = urlObj.protocol === 'https:' ? https : require('http');
    
    const req = protocol.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseData);
        } else {
          reject(new Error(`HTTP request failed with status ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Main execution
if (require.main === module) {
  console.log('🎯 IPv6-Only Deployment Trigger for NexusVPN (Fixed Version)');
  console.log('📅 Date: 2024-12-15');
  console.log('📝 Purpose: Deploy backend with IPv6-compatible database configuration\n');
  
  console.log('🔧 Configuration Summary:');
  console.log(`   🆔 Service ID: ${RENDER_SERVICE_ID}`);
  console.log('   🛠️  Build Cache: Cleared (fresh deployment)');
  console.log('   🌐 Network: IPv6-compatible (no IP forcing)');
  console.log('   ⏱️  Timeout: 30-second connection timeout');
  console.log('   📊 Pool Size: 10 connections max\n');
  
  triggerIPv6Deployment().catch(console.error);
}

module.exports = { triggerIPv6Deployment };