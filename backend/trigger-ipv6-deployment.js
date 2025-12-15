const axios = require('axios');

async function triggerIPv6Deployment() {
  console.log('🚀 Triggering IPv6-Compatible Deployment...');
  
  const apiKey = process.env.RENDER_API_KEY;
  if (!apiKey) {
    console.error('❌ RENDER_API_KEY not found in environment variables');
    return;
  }

  const serviceId = 'srv-d4vjm2muk2gs739fgqi0';
  const url = `https://api.render.com/v1/services/${serviceId}/deploys`;
  
  try {
    console.log('📡 Triggering deployment via Render API...');
    
    const response = await axios.post(url, {
      clearCache: 'clear' // Clear cache for fresh deployment
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ IPv6-Compatible Deployment Triggered Successfully!');
    console.log('📋 Deployment Details:');
    console.log(`  🆔 Deployment ID: ${response.data.id}`);
    console.log(`  🔄 Status: ${response.data.status}`);
    console.log(`  📅 Created: ${response.data.createdAt}`);
    console.log(`  🌐 Service: ${response.data.serviceId}`);
    
    console.log('\n🎯 IPv6 Configuration Applied:');
    console.log('  • Connection timeout: 30 seconds');
    console.log('  • Idle timeout: 30 seconds');
    console.log('  • Max pool connections: 10');
    console.log('  • Forced IPv6 family: 6');
    console.log('  • Application name: nexusvpn-api');
    
    console.log('\n⏱️  Expected deployment time: 5-15 minutes');
    console.log('📊 Monitor at: https://dashboard.render.com/web/srv-d4vjm2muk2gs739fgqi0');
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Deployment trigger failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.error('🔑 Invalid API key - check RENDER_API_KEY');
    } else if (error.response?.status === 404) {
      console.error('🎯 Service not found - check service ID');
    } else if (error.response?.status === 429) {
      console.error('⏰ Rate limited - wait before retrying');
    }
    
    process.exit(1);
  }
}

// Run the deployment
triggerIPv6Deployment().catch(console.error);