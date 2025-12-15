const { Pool } = require('pg');

/**
 * Test connection to your PostgreSQL server
 * Run this script to verify connectivity before deployment
 * Updated to disable SSL for your server configuration
 */

const config = {
  host: process.env.YOUR_DB_HOST || '91.99.23.239',
  port: parseInt(process.env.YOUR_DB_PORT, 10) || 5432,
  user: process.env.YOUR_DB_USER || 'postgres',
  password: process.env.YOUR_DB_PASSWORD || '',
  database: process.env.YOUR_DB_NAME || 'nexusvpn',
  ssl: false, // Disable SSL for your server
  connectionTimeoutMillis: 10000, // 10 seconds timeout
};

async function testConnection() {
  console.log('🧪 Testing connection to your PostgreSQL server...');
  console.log('📍 Server:', config.host + ':' + config.port);
  console.log('👤 User:', config.user);
  console.log('🗄️ Database:', config.database);
  console.log('🔒 SSL:', config.ssl);

  const pool = new Pool(config);

  try {
    console.log('⏳ Attempting connection...');
    const client = await pool.connect();
    
    console.log('✅ Connection successful!');
    
    // Test basic query
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL Version:', result.rows[0].version);
    
    // Test database creation capability
    try {
      await client.query('CREATE TABLE IF NOT EXISTS test_connection (id SERIAL PRIMARY KEY, test_time TIMESTAMP DEFAULT NOW())');
      console.log('✅ Table creation test successful');
      
      await client.query('DROP TABLE IF EXISTS test_connection');
      console.log('✅ Cleanup test successful');
    } catch (tableError) {
      console.log('⚠️ Table creation test failed (may need permissions):', tableError.message);
    }
    
    // Check existing databases
    const dbResult = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname');
    console.log('📋 Available databases:', dbResult.rows.map(row => row.datname).join(', '));
    
    // Check current user
    const userResult = await client.query('SELECT current_user, current_database()');
    console.log('👤 Current user:', userResult.rows[0].current_user);
    console.log('🗄️ Current database:', userResult.rows[0].current_database);
    
    await client.release();
    
    console.log('🎉 All tests passed! Your PostgreSQL server is ready for NexusVPN.');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('🔍 Error details:', {
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      address: error.address,
      port: error.port
    });
    
    // Provide troubleshooting suggestions
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('1. Check if PostgreSQL is running on your server');
    console.log('2. Verify firewall allows connections on port 5432');
    console.log('3. Check pg_hba.conf for authentication settings');
    console.log('4. Verify user credentials and database existence');
    console.log('5. Check PostgreSQL logs for connection attempts');
    
  } finally {
    await pool.end();
  }
}

// Run the test
testConnection().catch(console.error);