// login.js — Logic halaman login admin

document.addEventListener('DOMContentLoaded', () => {

  // Kalau sudah login, langsung ke dashboard
  if (isLoggedIn()) {
    window.location.href = './dashboard.html';
    return;
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

    const res = await login(email, password);

    if (res.success) {

      saveToken(res.token);

      localStorage.setItem(
        'admin_user',
        JSON.stringify(res.user)
      );

      // Redirect relatif
      window.location.href = './dashboard.html';

    } else {

      errEl.textContent =
        res.message || 'Email atau password salah';

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