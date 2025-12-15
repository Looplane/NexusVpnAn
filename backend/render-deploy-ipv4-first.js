#!/usr/bin/env node

/**
 * 🚀 **RENDER IPv4-FIRST DEPLOYMENT TRIGGER**
 * 
 * This script triggers a deployment using Render's deployment hook
 * with IPv4-first DNS resolution to resolve ENETUNREACH errors
 * 
 * Usage: node render-deploy-ipv4-first.js
 * 
 * Based on Render's recommendation: NODE_OPTIONS=--dns-result-order=ipv4first
 */

const https = require('https');
const url = require('url');

// Render deployment hook from the web reference
const DEPLOY_HOOK = 'https://api.render.com/deploy/srv-d4vjm2muk2gs739fgqi0?key=O-4z2JK4nds';

console.log('='.repeat(70));
console.log('🚀 RENDER IPv4-FIRST DEPLOYMENT TRIGGER');
console.log('='.repeat(70));
console.log(`🕐 Started: ${new Date().toISOString()}`);
console.log('');

/**
 * Trigger deployment using Render's deployment hook
 */
function triggerDeployment() {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(DEPLOY_HOOK);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    console.log('🎯 Triggering deployment via Render hook...');
    console.log(`🔗 URL: ${DEPLOY_HOOK}`);
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            console.log('✅ Deployment triggered successfully!');
            console.log(`📊 Deployment ID: ${response.deploy?.id || 'Unknown'}`);
            console.log(`🔗 Status: ${response.deploy?.status || 'Triggered'}`);
            resolve(response);
          } catch (error) {
            console.log('✅ Deployment triggered successfully!');
            console.log('📊 Response received (raw):', data);
            resolve({ success: true, rawResponse: data });
          }
        } else {
          console.error(`❌ Deployment trigger failed with status: ${res.statusCode}`);
          console.error('📊 Response:', data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Deployment hook request failed:', error.message);
      reject(error);
    });

    // Send empty POST body as required by Render
    req.write('{}');
    req.end();
  });
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('📋 DEPLOYMENT CONFIGURATION:');
    console.log('• Strategy: IPv4-first DNS resolution');
    console.log('• Environment: NODE_OPTIONS=--dns-result-order=ipv4first');
    console.log('• Target: Free tier (no IPv4 add-on)');
    console.log('• Hook: Render deployment webhook');
    console.log('');
    
    // Trigger the deployment
    const result = await triggerDeployment();
    
    console.log('');
    console.log('🎉 DEPLOYMENT TRIGGERED SUCCESSFULLY!');
    console.log('='.repeat(70));
    
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('1. ✅ Deployment has been triggered');
    console.log('2. 🔄 Monitor deployment progress at:');
    console.log('   https://dashboard.render.com/web/srv-d4vjm2muk2gs739fgqi0');
    console.log('3. 📊 Check logs for "Build successful" and "Your service is live"');
    console.log('4. 🔍 Look for database connection confirmation in logs');
    console.log('');
    
    console.log('⏱️  Expected timeline:');
    console.log('   • Build phase: 3-5 minutes');
    console.log('   • Deploy phase: 2-3 minutes');
    console.log('   • Total: 5-10 minutes');
    console.log('');
    
    console.log('🎯 SUCCESS INDICATORS:');
    console.log('   • Build completes without errors');
    console.log('   • Database connection established');
    console.log('   • API endpoints become accessible');
    console.log('   • No ENETUNREACH errors in logs');
    
  } catch (error) {
    console.error('');
    console.error('💥 DEPLOYMENT TRIGGER FAILED:');
    console.error(error.message);
    console.error('='.repeat(70));
    
    console.log('');
    console.log('🔄 MANUAL FALLBACK:');
    console.log('If the hook fails, manually trigger deployment:');
    console.log('1. Go to: https://dashboard.render.com/web/srv-d4vjm2muk2gs739fgqi0');
    console.log('2. Click "Manual Deploy" → "Deploy latest commit"');
    console.log('3. Ensure environment variable NODE_OPTIONS=--dns-result-order=ipv4first');
    
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { triggerDeployment, DEPLOY_HOOK };