document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('inp-email').value;
  const password = document.getElementById('inp-password').value;
  const errorDiv = document.getElementById('login-error');
  const btnLogin = document.getElementById('btn-login');
  
  // Disable button selama proses
  const originalText = btnLogin.textContent;
  btnLogin.disabled = true;
  btnLogin.textContent = 'Sedang masuk...';
  
  try {
    // Validasi input
    if (!email || !password) {
      errorDiv.innerText = 'Email dan password harus diisi!';
      errorDiv.classList.remove('hidden');
      return;
    }
    
    // Memanggil fungsi login dari api.js
    const result = await login(email, password);
    
    // Cek status response
    if (!result.ok && result.status >= 400) {
      errorDiv.innerText = result.message || 'Email atau password salah!';
      errorDiv.classList.remove('hidden');
      return;
    }
    
    if (result.success || result.token) {
      const userRole = result.user?.role;
      if (userRole === 'admin' || userRole === 'superadmin') {
        saveToken(result.token); // Fungsi bawaan api.js
        localStorage.setItem('admin_user', JSON.stringify(result.user));
        window.location.href = 'dashboard.html';
        return;
      }

      // Jika user biasa login di halaman admin, arahkan ke beranda utama
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_token');
      window.location.href = '../index.html';
      return;
    } else {
      errorDiv.innerText = result.message || 'Email atau password salah!';
      errorDiv.classList.remove('hidden');
    }
  } catch (err) {
    errorDiv.innerText = 'Gagal terhubung ke server backend.';
    errorDiv.classList.remove('hidden');
    console.error('Login error:', err);
  } finally {
    // Kembalikan button ke state awal
    btnLogin.disabled = false;
    btnLogin.textContent = originalText;
  }
});