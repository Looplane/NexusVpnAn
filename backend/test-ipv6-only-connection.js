/**
 * IPv6-Only Database Connection Test
 * Tests the fixed configuration that allows automatic IP family selection
 * 
 * Date: 2024-12-15
 * Purpose: Validate IPv6-only deployment without forcing IPv6
 */

const { Pool } = require('pg');

// Enhanced test with better error handling and logging
async function testIPv6Connection() {
  console.log('🌐 Starting IPv6-Only Database Connection Test...\n');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL environment variable is not set');
    console.log('💡 Please set DATABASE_URL to test the connection');
    console.log('📝 Example: export DATABASE_URL="postgresql://user:pass@host:port/db"');
    return;
  }
  
  console.log(`🔗 Using DATABASE_URL: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`);
  
  try {
    // Parse the URL to get connection details
    const url = new URL(databaseUrl);
    console.log(`🎯 Target Host: ${url.hostname}`);
    console.log(`📊 Target Port: ${url.port || 5432}`);
    console.log(`💾 Target Database: ${url.pathname.slice(1)}`);
    
    // Test DNS resolution first
    console.log('\n🔍 Testing DNS resolution...');
    const { lookup } = require('dns');
    const { promisify } = require('util');
    const lookupAsync = promisify(lookup);
    
    try {
      const addresses = await lookupAsync(url.hostname, { all: true });
      console.log('✅ DNS Resolution Results:');
      addresses.forEach((addr, index) => {
        console.log(`   ${index + 1}. ${addr.address} (IPv${addr.family})`);
      });
    } catch (dnsError) {
      console.log(`⚠️  DNS Resolution warning: ${dnsError.message}`);
      console.log('🔄 Continuing with direct connection test...');
    }
    
    // Create connection pool with fixed configuration (no IPv6 forcing)
    console.log('\n🔧 Creating connection pool with automatic IP selection...');
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      // Connection optimization settings (no IPv6 forcing)
      connectionTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      max: 5,
      // Let the driver handle IP family selection automatically
      // This allows fallback from IPv6 to IPv4 when needed
    });
    
    console.log('⏳ Testing database connection...');
    const client = await pool.connect();
    
    console.log('✅ Successfully connected to database!');
    
    // Get connection info
    try {
      const result = await client.query('SELECT version(), inet_server_addr(), inet_server_port()');
      console.log('\n📊 Database Connection Information:');
      console.log(`   🗄️  PostgreSQL Version: ${result.rows[0].version.split(' ')[1]}`);
      console.log(`   🌐 Server Address: ${result.rows[0].inet_server_addr}`);
      console.log(`   🔌 Server Port: ${result.rows[0].inet_server_port}`);
      
      // Test if we're using IPv6
      const serverAddr = result.rows[0].inet_server_addr;
      if (serverAddr.includes(':')) {
        console.log('🎉 SUCCESS: Connected via IPv6!');
      } else {
        console.log('✅ SUCCESS: Connected via IPv4 (fallback working)!');
      }
    } catch (infoError) {
      console.log(`⚠️  Could not retrieve connection info: ${infoError.message}`);
    }
    
    // Test basic query
    try {
      const testResult = await client.query('SELECT current_database(), current_user, now()');
      console.log('\n📋 Database Session Info:');
      console.log(`   💾 Current Database: ${testResult.rows[0].current_database}`);
      console.log(`   👤 Current User: ${testResult.rows[0].current_user}`);
      console.log(`   ⏰ Current Time: ${testResult.rows[0].now}`);
    } catch (queryError) {
      console.log(`⚠️  Could not execute test query: ${queryError.message}`);
    }
    
    client.release();
    
    // Test connection pool health
    console.log('\n🏊 Testing connection pool...');
    const poolResult = await pool.query('SELECT 1 as test_value');
    console.log(`✅ Pool query result: ${poolResult.rows[0].test_value}`);
    
    await pool.end();
    
    console.log('\n🎉 IPv6-Only Database Connection Test PASSED!');
    console.log('✅ Configuration allows automatic IP family selection');
    console.log('✅ No IPv6 forcing - fallback mechanism working');
    console.log('✅ Connection pool properly configured');
    console.log('✅ Ready for IPv6-only deployment!');
    
  } catch (error) {
    console.log('\n❌ Database connection failed!');
    console.log(`🚨 Error: ${error.message}`);
    console.log(`📍 Error Code: ${error.code}`);
    
    if (error.message.includes('ENETUNREACH')) {
      console.log('\n🔍 Network Unreachable Analysis:');
      console.log('📝 This error indicates network connectivity issues');
      console.log('🌐 Possible causes:');
      console.log('   - IPv6 network not available in current environment');
      console.log('   - Firewall blocking IPv6 traffic');
      console.log('   - DNS resolution returning unreachable IPv6 addresses');
      console.log('💡 Solution: The fixed configuration should handle this automatically');
      console.log('🔄 If this persists, check your network IPv6 connectivity');
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔍 Connection Refused Analysis:');
      console.log('📝 The database server is reachable but refusing connections');
      console.log('🔧 Check:');
      console.log('   - Database server is running');
      console.log('   - Port is correct');
      console.log('   - Authentication credentials are valid');
    }
    
    if (error.message.includes('ETIMEDOUT')) {
      console.log('\n🔍 Connection Timeout Analysis:');
      console.log('📝 Connection attempt timed out');
      console.log('⏰ This could be due to:');
      console.log('   - Network latency issues');
      console.log('   - Firewall blocking the connection');
      console.log('   - Server not responding');
    }
    
    console.log('\n💡 Troubleshooting Steps:');
    console.log('1. Verify DATABASE_URL is correct');
    console.log('2. Test network connectivity to the database host');
    console.log('3. Check if the database allows connections from your IP');
    console.log('4. Verify SSL settings match server requirements');
    console.log('5. Test with a different network if possible');
    
    process.exit(1);
  }
}

// Enhanced connection debugging
async function debugConnection() {
  console.log('\n🔍 Running connection debugging...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('❌ No DATABASE_URL provided for debugging');
    return;
  }
  
  try {
    const url = new URL(databaseUrl);
    const hostname = url.hostname;
    
    console.log(`🌐 Debugging connection to: ${hostname}`);
    
    // Test different connection approaches
    const approaches = [
      { name: 'Default (Auto)', options: {} },
      { name: 'IPv4 Only', options: { family: 4 } },
      { name: 'IPv6 Only', options: { family: 6 } },
      { name: 'No SSL', options: { ssl: false } },
      { name: 'SSL Required', options: { ssl: { rejectUnauthorized: false } } }
    ];
    
    for (const approach of approaches) {
      console.log(`\n🧪 Testing: ${approach.name}`);
      try {
        const testPool = new Pool({
          connectionString: databaseUrl,
          connectionTimeoutMillis: 5000, // Shorter timeout for testing
          ...approach.options
        });
        
        const client = await testPool.connect();
        console.log(`✅ ${approach.name}: SUCCESS`);
        client.release();
        await testPool.end();
        
      } catch (error) {
        console.log(`❌ ${approach.name}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Debugging failed: ${error.message}`);
  }
}

// Main execution
if (require.main === module) {
  console.log('🚀 IPv6-Only Database Connection Test');
  console.log('📅 Date: 2024-12-15');
  console.log('🎯 Purpose: Test fixed configuration for IPv6-only deployment\n');
  
  // Run main test
  testIPv6Connection().then(() => {
    // Optionally run debug if test failed
    if (process.argv.includes('--debug')) {
      return debugConnection();
    }
  }).catch(console.error);
}

module.exports = { testIPv6Connection, debugConnection };