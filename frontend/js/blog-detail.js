// blog-detail.js
document.addEventListener('DOMContentLoaded', loadDetail);

async function loadDetail() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) { showError(); return; }

  try {
    const res = await getBlogBySlug(slug);
    if (!res.success) { showError(); return; }

    const post = res.data;
    document.title = `${post.title} — Toko Pak Yanto`;

    if (post.thumbnail_url) {
      const img = document.getElementById('blog-thumbnail');
      img.src = getImageUrl(post.thumbnail_url);
      img.classList.remove('hidden');
    }

    document.getElementById('blog-title').textContent = post.title;
    document.getElementById('blog-date').textContent = formatDate(post.created_at);
    document.getElementById('blog-body').innerHTML = post.content || '';
    document.getElementById('blog-loading').classList.add('hidden');
    document.getElementById('blog-content').classList.remove('hidden');
  } catch (err) {
    showError();
  }
}

function showError() {
  document.getElementById('blog-loading').classList.add('hidden');
  document.getElementById('blog-error').classList.remove('hidden');
}
