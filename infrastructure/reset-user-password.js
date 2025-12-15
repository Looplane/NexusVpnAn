#!/usr/bin/env node
// Reset user password and make admin

const bcrypt = require('bcrypt');
const { execSync } = require('child_process');

const email = process.argv[2] || 'onetenstore@gmail.com';
const newPassword = process.argv[3] || 'Admin123!';

async function resetPassword() {
  try {
    console.log('=========================================');
    console.log('  🔐 Reset User Password');
    console.log('=========================================\n');
    
    console.log(`Email: ${email}`);
    console.log(`New Password: ${newPassword}\n`);
    
    // Hash password
    console.log('Hashing password...');
    const hash = await bcrypt.hash(newPassword, 10);
    
    // Update database
    console.log('Updating database...');
    const psqlCmd = `sudo -u postgres psql -d nexusvpn -c "UPDATE users SET \\"passwordHash\\" = '${hash}', role = 'admin', plan = 'pro' WHERE email = '${email}'; SELECT email, role, plan, \\"fullName\\" FROM users WHERE email = '${email}';"`;
    
    execSync(psqlCmd, { stdio: 'inherit' });
    
    console.log('\n✅ Password reset complete!');
    console.log('\n📋 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log('\n🌐 Login at: http://5.161.91.222:5173/#/login');
    console.log('🔧 Admin panel: http://5.161.91.222:5173/#/admin\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();

