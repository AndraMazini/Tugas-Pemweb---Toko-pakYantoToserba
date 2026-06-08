// kontak.js
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('form-inquiry').addEventListener('submit', handleSubmit);
});

async function handleSubmit(e) {
  e.preventDefault();

  const nama = document.getElementById('inp-nama').value.trim();
  const phone = document.getElementById('inp-phone').value.trim();
  const produk = document.getElementById('inp-produk').value.trim();
  const pesan = document.getElementById('inp-pesan').value.trim();
  const errEl = document.getElementById('form-error');
  const sukEl = document.getElementById('form-success');
  const btn = document.getElementById('btn-submit');

  errEl.classList.add('hidden');
  sukEl.classList.add('hidden');

  if (!nama || !phone) {
    errEl.textContent = 'Nama dan nomor HP wajib diisi!';
    errEl.classList.remove('hidden');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Mengirim...';

  try {
    const res = await submitOrder({
      customer_name: nama,
      phone,
      product_interest: produk,
      message: pesan
    });

    if (res.success) {
      sukEl.textContent = 'Inquiry berhasil dikirim! Mengarahkan ke WhatsApp...';
      sukEl.classList.remove('hidden');
      document.getElementById('form-inquiry').reset();
      setTimeout(() => {
        window.open(res.wa_link, '_blank');
      }, 1000);
    } else {
      errEl.textContent = res.message || 'Gagal mengirim inquiry';
      errEl.classList.remove('hidden');
    }
  } catch (err) {
    errEl.textContent = 'Terjadi kesalahan, coba lagi nanti';
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = '💬 Kirim via WhatsApp';
  }
}
