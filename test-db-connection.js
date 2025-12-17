const { DataSource } = require('typeorm');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  console.error('Please set DATABASE_URL in your .env file or environment variables.');
  process.exit(1);
}

const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  ssl: { rejectUnauthorized: false },
  synchronize: false,
  logging: true
});

console.log('Testing database connection...');
console.log('URL:', databaseUrl.replace(/:[^:@]+@/, ':****@')); // Mask password in logs

AppDataSource.initialize()
  .then(() => {
    console.log('✅ Database connection successful!');
    return AppDataSource.query('SELECT version()');
  })
  .then(result => {
    console.log('PostgreSQL version:', result[0].version);
    return AppDataSource.destroy();
  })
  .then(() => {
    console.log('✅ Test completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  });