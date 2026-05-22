// login.js — Logic halaman login admin

document.addEventListener('DOMContentLoaded', () => {
  // Kalau sudah login dan rolenya admin/superadmin, langsung ke dashboard
  const savedUser = localStorage.getItem('admin_user');
  if (savedUser) {
    const user = JSON.parse(savedUser);
    if (user.role === 'admin' || user.role === 'superadmin') {
      window.location.href = './dashboard.html';
      return;
    }
  }

  document
    .getElementById('form-login')
    .addEventListener('submit', handleLogin);
});

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('inp-email').value.trim();
  const password = document.getElementById('inp-password').value;

  const errEl = document.getElementById('login-error');
  const btn = document.getElementById('btn-login');

  errEl.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'Masuk...';

  try {
    // Memanggil fungsi login bawaan project kamu
    const res = await login(email, password); 

    if (res.success) {
      // 🌟 SINKRONISASI ROLE CHECK
      if (res.user.role === 'user') {
        // Jika pelanggan biasa yang login, arahkan ke halaman utama user
        saveToken(res.token);
        localStorage.setItem('customer_user', JSON.stringify(res.user));
        window.location.href = '../index.html';
      } else {
        // Jika admin atau superadmin, arahkan ke dashboard admin
        saveToken(res.token);
        localStorage.setItem('admin_user', JSON.stringify(res.user));
        window.location.href = './dashboard.html';
      }
    } else {
      errEl.textContent = res.message || 'Email atau password salah';
      errEl.classList.remove('hidden');
    }
  } catch (err) {
    console.error(err);
    errEl.textContent = 'Gagal terhubung ke server';
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Masuk';
  }
}