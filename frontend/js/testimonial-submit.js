document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addReviewForm");
  const starContainer = document.getElementById("starRatingSelect");
  const ratingInput = document.getElementById("reviewerRating");

  if (!form) return;

  let selectedRating = Number(ratingInput?.value || 0);

  function renderStars(value) {
    const stars = starContainer?.querySelectorAll("[data-value]");
    stars?.forEach((star) => {
      const starValue = Number(star.getAttribute("data-value"));
      if (starValue <= value) {
        star.classList.remove("bi-star");
        star.classList.add("bi-star-fill");
      } else {
        star.classList.remove("bi-star-fill");
        star.classList.add("bi-star");
      }
    });
  }

  if (starContainer) {
    const stars = starContainer.querySelectorAll("[data-value]");

    stars.forEach((star) => {
      star.addEventListener("click", () => {
        selectedRating = Number(star.getAttribute("data-value"));
        if (ratingInput) ratingInput.value = selectedRating;
        renderStars(selectedRating);
      });
    });
  }

  renderStars(selectedRating || 0);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("reviewerName");
    const reviewInput = document.getElementById("reviewerText");
    const submitBtn = form.querySelector('button[type="submit"]');

    const name = nameInput?.value.trim() || "";
    const review = reviewInput?.value.trim() || "";

    if (!name) {
      alert("Nama wajib diisi.");
      nameInput?.focus();
      return;
    }

    if (!review) {
      alert("Isi ulasan wajib diisi.");
      reviewInput?.focus();
      return;
    }

    const originalText = submitBtn?.innerHTML || "Kirim Ulasan";

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Mengirim...`;
      }

      const result = await submitTestimonial({
        name,
        review
    });

      if (result?.success) {
        alert("Ulasan berhasil dikirim dan menunggu persetujuan admin.");
        form.reset();
        selectedRating = 0;
        if (ratingInput) ratingInput.value = "";
        renderStars(0);
      } else {
        alert(result?.message || "Gagal mengirim ulasan.");
      }
    } catch (error) {
      console.error("Submit testimonial error:", error);
      alert(error.message || "Terjadi kesalahan saat mengirim ulasan.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    }
  });
});