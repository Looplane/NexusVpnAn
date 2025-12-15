/**
 * 🌐 IPv6 Connectivity Test with Fallback Validation
 * 
 * This script comprehensively tests IPv6 connectivity and validates
 * the fallback mechanisms implemented in the DatabaseConfigService
 */

const { Pool } = require('pg');
const dns = require('dns');
const { promisify } = require('util');
const lookup = promisify(dns.lookup);

// IPv6 Test Configuration
const IPV6_TEST_CONFIG = {
  timeout: 60000, // 60 seconds
  retryAttempts: 5,
  retryDelay: 5000, // 5 seconds
  fallbackEnabled: true
};

/**
 * Main IPv6 connectivity test function
 */
async function testIPv6Connectivity() {
  console.log('🧪 Starting Comprehensive IPv6 Connectivity Test...');
  
  try {
    // Step 1: Test DNS resolution
    const dnsTest = await testDNSResolution();
    
    // Step 2: Test direct IPv6 connectivity
    const ipv6Test = await testDirectIPv6();
    
    // Step 3: Test IPv4 fallback
    const ipv4Fallback = await testIPv4Fallback();
    
    // Step 4: Test database connection with fallback
    const dbTest = await testDatabaseConnection();
    
    // Generate comprehensive report
    const report = generateConnectivityReport({
      dnsTest,
      ipv6Test,
      ipv4Fallback,
      dbTest
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 IPv6 CONNECTIVITY TEST REPORT');
    console.log('='.repeat(60));
    console.log(report);
    
    return {
      success: dbTest.success,
      report,
      details: { dnsTest, ipv6Test, ipv4Fallback, dbTest }
    };
    
  } catch (error) {
    console.error('❌ IPv6 connectivity test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test DNS resolution for IPv6 and IPv4
 */
async function testDNSResolution() {
  console.log('🔍 Testing DNS Resolution...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL not configured');
  }
  
  try {
    const url = new URL(databaseUrl);
    const hostname = url.hostname;
    
    console.log(`Testing hostname: ${hostname}`);
    
    // Test IPv6 resolution
    let ipv6Result = null;
    try {
      ipv6Result = await lookup(hostname, { family: 6 });
      console.log(`✅ IPv6 resolution successful: ${ipv6Result.address}`);
    } catch (ipv6Error) {
      console.log(`⚠️ IPv6 resolution failed: ${ipv6Error.message}`);
    }
    
    // Test IPv4 resolution
    let ipv4Result = null;
    try {
      ipv4Result = await lookup(hostname, { family: 4 });
      console.log(`✅ IPv4 resolution successful: ${ipv4Result.address}`);
    } catch (ipv4Error) {
      console.log(`⚠️ IPv4 resolution failed: ${ipv4Error.message}`);
    }
    
    return {
      hostname,
      ipv6: ipv6Result,
      ipv4: ipv4Result,
      success: ipv6Result !== null || ipv4Result !== null
    };
    
  } catch (error) {
    console.error('❌ DNS resolution test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test direct IPv6 connectivity
 */
async function testDirectIPv6() {
  console.log('🌐 Testing Direct IPv6 Connectivity...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL not configured');
  }
  
  try {
    const url = new URL(databaseUrl);
    const hostname = url.hostname;
    
    // Check if hostname is IPv6
    const isIPv6 = hostname.includes(':') && hostname.split(':').length > 2;
    
    if (!isIPv6) {
      console.log('ℹ️ Hostname is not IPv6, skipping direct IPv6 test');
      return { success: true, skipped: true, reason: 'Not an IPv6 address' };
    }
    
    console.log(`Testing direct IPv6 connection to: ${hostname}`);
    
    // Test IPv6 connectivity with retry logic
    for (let attempt = 1; attempt <= IPV6_TEST_CONFIG.retryAttempts; attempt++) {
      console.log(`IPv6 connection attempt ${attempt}/${IPV6_TEST_CONFIG.retryAttempts}`);
      
      try {
        // Create connection pool with IPv6-specific settings
        const pool = new Pool({
          connectionString: databaseUrl,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: IPV6_TEST_CONFIG.timeout,
          idleTimeoutMillis: 30000,
          max: 1, // Single connection for testing
          
          // IPv6-specific settings
          keepAlive: true,
          keepAliveInitialDelayMillis: 10000,
        });
        
        // Test connection
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        await pool.end();
        
        console.log('✅ Direct IPv6 connectivity test passed');
        return { success: true, attempt };
        
      } catch (error) {
        console.log(`⚠️ IPv6 attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < IPV6_TEST_CONFIG.retryAttempts) {
          const delay = IPV6_TEST_CONFIG.retryDelay * Math.pow(2, attempt - 1);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.log('❌ All IPv6 connection attempts failed');
    return { 
      success: false, 
      error: 'All IPv6 connection attempts failed',
      attempts: IPV6_TEST_CONFIG.retryAttempts 
    };
    
  } catch (error) {
    console.error('❌ Direct IPv6 test failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test IPv4 fallback
 */
async function testIPv4Fallback() {
  console.log('🔄 Testing IPv4 Fallback...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL not configured');
  }
  
  try {
    const url = new URL(databaseUrl);
    const hostname = url.hostname;
    
    // Check if we can resolve IPv4 for this hostname
    try {
      const ipv4Result = await lookup(hostname, { family: 4 });
      console.log(`✅ IPv4 fallback available: ${ipv4Result.address}`);
      
      // Create IPv4-only connection string
      const ipv4Url = new URL(databaseUrl);
      ipv4Url.hostname = ipv4Result.address;
      
      console.log(`Testing IPv4 fallback connection to: ${ipv4Result.address}`);
      
      // Test IPv4 connection
      const pool = new Pool({
        connectionString: ipv4Url.toString(),
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 30000,
        max: 1,
      });
      
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      await pool.end();
      
      console.log('✅ IPv4 fallback test passed');
      return { 
        success: true, 
        ipv4Address: ipv4Result.address,
        connectionString: ipv4Url.toString()
      };
      
    } catch (ipv4Error) {
      console.log(`⚠️ IPv4 fallback failed: ${ipv4Error.message}`);
      return { success: false, error: ipv4Error.message };
    }
    
  } catch (error) {
    console.error('❌ IPv4 fallback test failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test database connection with automatic fallback
 */
async function testDatabaseConnection() {
  console.log('🗄️ Testing Database Connection with Fallback...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL not configured');
  }
  
  try {
    // Test with our enhanced configuration (simulating DatabaseConfigService)
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 60000,
      idleTimeoutMillis: 30000,
      max: 3,
      
      // IPv6-specific settings
      keepAlive: true,
      keepAliveInitialDelayMillis: 15000,
    });
    
    console.log('Testing database connection...');
    
    const client = await pool.connect();
    const result = await client.query('SELECT version(), current_database(), inet_server_addr()');
    
    console.log('✅ Database connection successful');
    console.log(`📊 PostgreSQL Version: ${result.rows[0].version}`);
    console.log(`🗄️ Database: ${result.rows[0].current_database}`);
    console.log(`🌐 Server Address: ${result.rows[0].inet_server_addr}`);
    
    client.release();
    await pool.end();
    
    return { 
      success: true, 
      version: result.rows[0].version,
      database: result.rows[0].current_database,
      serverAddress: result.rows[0].inet_server_addr
    };
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Generate comprehensive connectivity report
 */
function generateConnectivityReport(results) {
  const { dnsTest, ipv6Test, ipv4Fallback, dbTest } = results;
  
  let report = '';
  
  // DNS Resolution Summary
  report += '\n🔍 DNS RESOLUTION:\n';
  if (dnsTest.success) {
    report += `✅ Hostname: ${dnsTest.hostname}\n`;
    if (dnsTest.ipv6) report += `✅ IPv6: ${dnsTest.ipv6.address}\n`;
    if (dnsTest.ipv4) report += `✅ IPv4: ${dnsTest.ipv4.address}\n`;
  } else {
    report += `❌ Failed: ${dnsTest.error}\n`;
  }
  
  // IPv6 Connectivity Summary
  report += '\n🌐 IPv6 CONNECTIVITY:\n';
  if (ipv6Test.success) {
    if (ipv6Test.skipped) {
      report += `ℹ️ Skipped: ${ipv6Test.reason}\n`;
    } else {
      report += `✅ Direct IPv6 connection successful (attempt ${ipv6Test.attempt})\n`;
    }
  } else {
    report += `❌ Failed: ${ipv6Test.error}\n`;
  }
  
  // IPv4 Fallback Summary
  report += '\n🔄 IPv4 FALLBACK:\n';
  if (ipv4Fallback.success) {
    report += `✅ IPv4 fallback successful: ${ipv4Fallback.ipv4Address}\n`;
  } else {
    report += `❌ IPv4 fallback failed: ${ipv4Fallback.error}\n`;
  }
  
  // Database Connection Summary
  report += '\n🗄️ DATABASE CONNECTION:\n';
  if (dbTest.success) {
    report += `✅ Connection successful\n`;
    report += `📊 Version: ${dbTest.version.split(' ')[1]}\n`;
    report += `🗄️ Database: ${dbTest.database}\n`;
    report += `🌐 Server: ${dbTest.serverAddress}\n`;
  } else {
    report += `❌ Connection failed: ${dbTest.error}\n`;
  }
  
  // Overall Status
  report += '\n' + '='.repeat(40) + '\n';
  report += dbTest.success ? '✅ OVERALL: SUCCESS' : '❌ OVERALL: FAILED';
  report += '\n' + '='.repeat(40);
  
  return report;
}

// Execute test if run directly
if (require.main === module) {
  testIPv6Connectivity()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test execution failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testIPv6Connectivity };