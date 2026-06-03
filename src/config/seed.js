const bcrypt = require('bcryptjs');
const db = require('../../src/config/db');

async function seed() {
  const password = 'admin123'; // ganti sesuai kebutuhan
  const hash = await bcrypt.hash(password, 10);

  await db.execute(
    `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE password = ?`,
    ['Super Admin', 'admin@toko.com', hash, 'superadmin', hash]
  );

  console.log('✅ Admin seeded! Email: admin@toko.com | Password: admin123');
  process.exit();
}

seed().catch(console.error);