document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-user-login');
  const emailInput = document.getElementById('inp-user-email');
  const passwordInput = document.getElementById('inp-user-password');
  const errorDiv = document.getElementById('login-user-error');
  const infoName = document.getElementById('user-login-info-name');
  const loginBtn = document.getElementById('btn-user-login');

  if (!form) return;

  // Show logged-in name (optional)
  try {
    const user = JSON.parse(localStorage.getItem('admin_user') || 'null');
    if (user?.name && infoName) infoName.textContent = user.name;
  } catch (_) {
    // ignore
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (errorDiv) errorDiv.classList.add('hidden');

    const email = emailInput?.value?.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
      if (errorDiv) {
        errorDiv.textContent = 'Email dan password harus diisi!';
        errorDiv.classList.remove('hidden');
      }
      return;
    }

    const originalText = loginBtn?.textContent;
    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.textContent = 'Sedang masuk...';
    }

    try {
      const result = await login(email, password);

      if (!result || !result.success || !result.token) {
        if (errorDiv) {
          errorDiv.textContent = result?.message || 'Email atau password salah!';
          errorDiv.classList.remove('hidden');
        }
        return;
      }

      // Sinergikan dengan mechanism yang sudah ada di api.js (key lokal sama untuk user/admin)
      saveToken(result.token);
      localStorage.setItem('admin_user', JSON.stringify(result.user));

      // Setelah login, tetap di index.html (sesuai jawaban user)
      if (infoName && result.user?.name) {
        infoName.textContent = result.user.name;
      }

      // Tutup modal jika modal bootstrap dipakai
      const modalEl = document.getElementById('userLoginModal');
      if (modalEl && window.bootstrap?.Modal) {
        window.bootstrap.Modal.getInstance(modalEl)?.hide();
      } else {
        // fallback hide container
        const modalBackdrop = document.querySelector('.modal-backdrop');
        if (modalBackdrop) modalBackdrop.remove();
      }

      // Refresh state navbar admin button (dan opsional UI pengguna)
      const adminBtn = document.getElementById('admin-btn');
      if (adminBtn) {
        const user = result.user;
        if (user?.role && (user.role === 'admin' || user.role === 'superadmin')) {
          adminBtn.classList.remove('d-none');
        } else {
          adminBtn.classList.add('d-none');
        }
      }
    } catch (err) {
      console.error('User login error:', err);
      if (errorDiv) {
        errorDiv.textContent = 'Gagal terhubung ke server backend.';
        errorDiv.classList.remove('hidden');
      }
    } finally {
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = originalText || 'Masuk';
      }
    }
  });
});

