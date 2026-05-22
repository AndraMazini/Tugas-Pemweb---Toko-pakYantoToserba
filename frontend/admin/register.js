const form = document.getElementById('form-register');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const msg = document.getElementById('msg');

  msg.textContent = '';
  msg.className = 'msg block text-center p-2 rounded-lg mb-4 text-sm font-semibold'; // Memastikan kelas tampil baik

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const result = await response.json();

    if(result.success){
      msg.textContent = 'Register akun berhasil! Mengalihkan ke Beranda...';
      msg.style.color = '#155724';
      msg.style.backgroundColor = '#d4edda';

      // 🌟 PERBAIKAN REDIRECT: Langsung dilempar ke index.html tampilan user
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1500);

    } else {
      msg.textContent = result.message || 'Register gagal';
      msg.style.color = '#721c24';
      msg.style.backgroundColor = '#f8d7da';
    }

  } catch(err){
    console.error(err);
    msg.textContent = 'Tidak dapat terhubung ke server';
    msg.style.color = '#721c24';
    msg.style.backgroundColor = '#f8d7da';
  }
});