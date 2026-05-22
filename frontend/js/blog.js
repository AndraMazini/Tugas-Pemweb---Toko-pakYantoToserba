// blog.js
let currentPage = 1;
const LIMIT = 6;

document.addEventListener('DOMContentLoaded', loadBlog);

async function loadBlog() {
  const grid = document.getElementById('blog-grid');
  grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-16">Memuat artikel...</div>';
  try {
    const res = await getBlogPosts({ page: currentPage, limit: LIMIT });
    if (!res.success || res.data.length === 0) {
      grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-16">Belum ada artikel</div>';
      return;
    }
    grid.innerHTML = res.data.map(post => `
      <a href="/blog-detail.html?slug=${post.slug}"
         class="bg-white rounded-2xl shadow hover:shadow-lg hover:-translate-y-1 transition overflow-hidden block">
        <div class="h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
          ${post.thumbnail_url
            ? `<img src="${getImageUrl(post.thumbnail_url)}" alt="${post.title}" class="w-full h-full object-cover">`
            : `<span class="text-4xl">📝</span>`}
        </div>
        <div class="p-4">
          <h3 class="font-bold text-gray-800 text-sm leading-snug">${post.title}</h3>
          <p class="text-xs text-gray-400 mt-2">${formatDate(post.created_at)}</p>
        </div>
      </a>
    `).join('');
    renderPagination(res.pagination);
  } catch (err) {
    grid.innerHTML = '<div class="col-span-full text-center text-red-400 py-16">Gagal memuat artikel</div>';
  }
}

function renderPagination(pagination) {
  const container = document.getElementById('pagination');
  if (!pagination || pagination.totalPages <= 1) { container.innerHTML = ''; return; }
  let html = '';
  for (let i = 1; i <= pagination.totalPages; i++) {
    html += `<button onclick="gantiHalaman(${i})"
      class="w-10 h-10 rounded-full text-sm font-semibold ${i === currentPage ? 'bg-orange-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-orange-400'}">
      ${i}</button>`;
  }
  container.innerHTML = html;
}

function gantiHalaman(page) {
  currentPage = page;
  loadBlog();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
