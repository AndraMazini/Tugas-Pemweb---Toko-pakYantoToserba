const body = document.body;
const darkModeToggle = document.getElementById("darkModeToggle");
const toastFloat = document.getElementById("toastFloat");

function showToast(message) {
  if (!toastFloat) return;

  toastFloat.textContent = message;
  toastFloat.style.display = "block";
  toastFloat.style.opacity = "1";

  setTimeout(() => {
    toastFloat.style.opacity = "0";
    setTimeout(() => {
      toastFloat.style.display = "none";
    }, 300);
  }, 1800);
}

function initDarkMode() {
  const savedTheme = localStorage.getItem("toserba-public-theme");

  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
    if (darkModeToggle) {
      darkModeToggle.innerHTML = '<i class="bi bi-sun-fill"></i>';
    }
  }

  darkModeToggle?.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
      localStorage.setItem("toserba-public-theme", "dark");
      darkModeToggle.innerHTML = '<i class="bi bi-sun-fill"></i>';
      showToast("Dark mode diaktifkan");
    } else {
      localStorage.setItem("toserba-public-theme", "light");
      darkModeToggle.innerHTML = '<i class="bi bi-moon-stars-fill"></i>';
      showToast("Light mode diaktifkan");
    }
  });
}

async function loadPublicData() {
  try {
    const [categoriesRes, productsRes, galleryRes, blogRes, testimonialsRes] = await Promise.all([
      window.PublicAPI.getCategories(),
      window.PublicAPI.getProducts("?featured=true&limit=6"),
      window.PublicAPI.getGallery(),
      window.PublicAPI.getBlogPosts("?limit=6"),
      window.PublicAPI.getTestimonials()
    ]);

    const categories = categoriesRes?.data || [];
    const products = productsRes?.data || [];
    const gallery = galleryRes?.data || [];
    const blogs = blogRes?.data || [];
    const testimonials = testimonialsRes?.data || [];

    window.PublicUI.renderCategories(categories);
    window.PublicUI.renderProducts(products);
    window.PublicUI.renderGallery(gallery);
    window.PublicUI.renderBlogPosts(blogs);
    window.PublicUI.renderTestimonials(testimonials);
    window.PublicUI.fillProductSelect(products);
  } catch (error) {
    console.error("Gagal memuat data website:", error);
    showToast("Data dinamis belum berhasil dimuat");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  initDarkMode();

  if (window.PublicForm && typeof window.PublicForm.initInquiryForm === "function") {
    window.PublicForm.initInquiryForm();
  }

  await loadPublicData();
});

window.showToast = showToast;