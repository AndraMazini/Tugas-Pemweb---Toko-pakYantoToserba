const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'toko_db',
  waitForConnections: true,
  connectionLimit: 10,
});

const db = pool.promise();

async function syncUserRoleEnum() {
  try {
    const [rows] = await db.query("SHOW COLUMNS FROM users WHERE Field = 'role'");
    if (rows.length === 0) {
      console.warn('⚠️ Table users tidak ditemukan. Pastikan database sudah terinisialisasi.');
      return;
    }

    const columnType = rows[0].Type;
    // Jika schema lama menggunakan 'customer' dan belum ada 'user', tambahkan 'user' terlebih dahulu (sementara)
    if (columnType.includes("'customer'") && !columnType.includes("'user'")) {
      console.log("🔁 Menemukan value 'customer' pada users.role — menambahkan sementara 'user' ke enum...");
      try {
        // Tambahkan 'user' ke enum tanpa menghapus 'customer'
        await db.query("ALTER TABLE users MODIFY role ENUM('customer','user','admin','superadmin') DEFAULT 'customer'");
        console.log("✅ 'user' ditambahkan ke enum sementara.");

        // Sekarang aman untuk mengupdate data
        await db.query("UPDATE users SET role = 'user' WHERE role = 'customer'");
        console.log("✅ Semua nilai 'customer' telah diubah menjadi 'user'.");

        // Terakhir, ubah enum menjadi final tanpa 'customer'
        await db.query("ALTER TABLE users MODIFY role ENUM('user','admin','superadmin') DEFAULT 'user'");
        console.log("✅ Schema users.role berhasil disinkronkan dan 'customer' dihapus dari enum.");
      } catch (err) {
        console.error('❌ Gagal menyesuaikan atau memperbarui nilai role:', err.message);
      }
    } else if (!columnType.includes("'user'")) {
      // Jika columnType sama sekali tidak memiliki 'user', langsung tambahkan final enum
      console.log('🔧 Menyesuaikan schema users.role untuk mendukung user...');
      try {
        await db.query("ALTER TABLE users MODIFY role ENUM('user','admin','superadmin') DEFAULT 'user'");
        console.log('✅ Schema users.role berhasil disinkronkan.');
      } catch (err) {
        console.error('❌ Gagal mensinkronkan schema users.role:', err.message);
      }
    }
  } catch (err) {
    console.error('❌ Gagal mensinkronkan schema users.role:', err.message);
  }
}

// Test connection
db.getConnection()
  .then(async conn => {
    console.log('✅ Database connected successfully');
    conn.release();
    await syncUserRoleEnum();
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  });

module.exports = db;