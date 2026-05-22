const form = document.getElementById('form-register');

form.addEventListener('submit', async (e) => {

  e.preventDefault();

  const name = document.getElementById('name').value.trim();

  const email = document.getElementById('email').value.trim();

  const password = document.getElementById('password').value;

  const msg = document.getElementById('msg');

  msg.textContent = '';
  msg.className = 'msg';

  try {

    const response = await fetch(
      'http://localhost:5000/api/auth/register',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          name,
          email,
          password
        })
      }
    );

    const result = await response.json();

    if(result.success){

      msg.textContent = 'Register berhasil!';
      msg.classList.add('success');

      setTimeout(() => {
        window.location.href = './login.html';
      }, 1500);

    } else {

      msg.textContent =
        result.message || 'Register gagal';

      msg.classList.add('error');
    }

  } catch(err){

    console.error(err);

    msg.textContent = 'Tidak dapat terhubung ke server';

    msg.classList.add('error');
  }
});