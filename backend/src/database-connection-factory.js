const { createConnection } = require('net');
const { lookup } = require('dns');
const { promisify } = require('util');

const lookupAsync = promisify(lookup);

/**
 * Custom connection factory that tries IPv4 first, then IPv6 fallback
 * This solves the Render IPv6 connectivity issue
 */
async function createDatabaseConnection(config) {
  const originalHost = config.host || new URL(config.url).hostname;
  
  console.log(`🔍 Resolving database host: ${originalHost}`);
  
  try {
    // Try to resolve the hostname and get available addresses
    const addresses = await lookupAsync(originalHost, { all: true });
    console.log(`📡 Found ${addresses.length} addresses for ${originalHost}`);
    
    // Sort addresses: IPv4 first, then IPv6
    const sortedAddresses = addresses.sort((a, b) => {
      if (a.family === 4 && b.family === 6) return -1;
      if (a.family === 6 && b.family === 4) return 1;
      return 0;
    });
    
    console.log(`🎯 Address priority:`, sortedAddresses.map(addr => `${addr.address} (IPv${addr.family})`));
    
    // Try each address until one works
    for (const addr of sortedAddresses) {
      try {
        console.log(`🔄 Trying IPv${addr.family} connection to ${addr.address}`);
        
        // Test connectivity with a simple socket connection
        await testConnection(addr.address, addr.family);
        
        console.log(`✅ IPv${addr.family} connection successful!`);
        
        // Update config to use the working address
        if (config.url) {
          // For URL-based config, we need to modify the URL
          const url = new URL(config.url);
          url.hostname = addr.address;
          config.url = url.toString();
        } else {
          // For host-based config, update the host
          config.host = addr.address;
        }
        
        // Set the family for the connection
        config.family = addr.family;
        
        return config;
        
      } catch (connectionError) {
        console.log(`❌ IPv${addr.family} connection failed: ${connectionError.message}`);
        continue;
      }
    }
    
    throw new Error('All address connection attempts failed');
    
  } catch (error) {
    console.error(`❌ Host resolution failed: ${error.message}`);
    
    // Fallback: try with the original hostname and let the database driver handle it
    console.log(`🔄 Falling back to original hostname: ${originalHost}`);
    
    if (config.url) {
      // Keep original URL but add fallback configuration
      config.extra = {
        ...config.extra,
        connectionTimeoutMillis: 30000,
        fallback: true
      };
    }
    
    return config;
  }
}

/**
 * Test basic connectivity to an address
 */
function testConnection(address, family) {
  return new Promise((resolve, reject) => {
    const socket = createConnection({
      host: address,
      port: 5432, // PostgreSQL default port
      family: family,
      timeout: 5000 // 5 second timeout for test
    });
    
    socket.on('connect', () => {
      socket.destroy();
      resolve();
    });
    
    socket.on('error', (err) => {
      reject(err);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('Connection timeout'));
    });
  });
}

module.exports = { createDatabaseConnection };