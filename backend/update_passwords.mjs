import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgres://postgres:123@localhost:5432/werehouse'
});

async function main() {
  await client.connect();
  const hash = '$2a$10$eHT02OiTgBGiOYjSTNesHeuSKnP57y.wBQqMRsIs3Wqh4jdtRsJIy'; // password123
  const res = await client.query('UPDATE public.users SET password_hash = $1', [hash]);
  console.log('Successfully updated user password hashes! Count:', res.rowCount);
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
