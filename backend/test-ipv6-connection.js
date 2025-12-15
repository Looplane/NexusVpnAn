const { Pool } = require('pg');

async function testIPv6Connection() {
  console.log('🧪 Testing IPv6 Database Connection...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    return;
  }

  console.log('📡 Using DATABASE_URL:', databaseUrl.replace(/:[^:@]+@/, ':****@'));

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    // IPv6 specific configuration
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 5,
    family: 6, // Force IPv6
  });

  try {
    console.log('🔄 Attempting to connect to database...');
    const client = await pool.connect();
    
    console.log('✅ Successfully connected to database!');
    
    // Test a simple query
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL Version:', result.rows[0].version);
    
    // Test IPv6 connectivity info
    const connInfo = await client.query(`
      SELECT 
        inet_server_addr() as server_address,
        inet_client_addr() as client_address,
        version() as postgres_version
    `);
    
    console.log('🌐 Connection Info:');
    console.log('  Server Address:', connInfo.rows[0].server_address);
    console.log('  Client Address:', connInfo.rows[0].client_address);
    
    client.release();
    
    console.log('🎉 IPv6 Database Connection Test PASSED!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('🔍 Error details:', error.code, error.errno);
    
    if (error.code === 'ENETUNREACH') {
      console.error('🚨 IPv6 Network Unreachable - Check if Render supports IPv6');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🚨 Connection Refused - Check database URL and credentials');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🚨 Host Not Found - Check database hostname');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the test
testIPv6Connection().catch(console.error);