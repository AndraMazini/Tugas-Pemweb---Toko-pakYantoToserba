// galeri.js
document.addEventListener('DOMContentLoaded', loadGaleri);

async function loadGaleri() {
  const grid = document.getElementById('galeri-grid');
  try {
    const res = await getGallery();
    if (!res.success || res.data.length === 0) {
      grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-16">Belum ada foto galeri</div>';
      return;
    }
    grid.innerHTML = res.data.map(foto => `
      <div class="relative group overflow-hidden rounded-2xl shadow hover:shadow-lg transition">
        <img src="${getImageUrl(foto.image_url)}" alt="${foto.caption || 'Foto toko'}"
          class="w-full h-48 object-cover group-hover:scale-105 transition duration-300">
        ${foto.caption ? `
          <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 translate-y-full group-hover:translate-y-0 transition">
            ${foto.caption}
          </div>` : ''}
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<div class="col-span-full text-center text-red-400 py-16">Gagal memuat galeri</div>';
  }
}
