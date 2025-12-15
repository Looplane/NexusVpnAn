const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
  type: 'postgres',
  url: 'postgresql://postgres:NexusVPN02110@db.xorjbccyuinebimlxblu.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
  synchronize: false,
  logging: true
});

console.log('Testing database connection...');
console.log('URL:', 'postgresql://postgres:NexusVPN02110@db.xorjbccyuinebimlxblu.supabase.co:5432/postgres');

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