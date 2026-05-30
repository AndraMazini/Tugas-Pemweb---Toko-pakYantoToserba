function showFieldError(input, message) {
  if (!input) return;
  input.classList.add("is-invalid");

  let feedback = input.parentElement.querySelector(".invalid-feedback");
  if (!feedback) {
    feedback = document.createElement("div");
    feedback.className = "invalid-feedback";
    input.parentElement.appendChild(feedback);
  }

  feedback.textContent = message;
}

function clearFieldError(input) {
  if (!input) return;
  input.classList.remove("is-invalid");

  const feedback = input.parentElement.querySelector(".invalid-feedback");
  if (feedback) feedback.textContent = "";
}

function validatePhone(phone) {
  return /^(\+62|62|0)[0-9]{8,13}$/.test(phone);
}

async function handleInquirySubmit(event) {
  event.preventDefault();

  const form = event.target;
  const nameInput = document.getElementById("customerName");
  const phoneInput = document.getElementById("customerPhone");
  const productSelect = document.getElementById("productInterest");
  const messageInput = document.getElementById("customerMessage");
  const submitButton = document.getElementById("submitInquiryBtn");

  [nameInput, phoneInput, productSelect, messageInput].forEach(clearFieldError);

  const customer_name = nameInput?.value.trim() || "";
  const phone = phoneInput?.value.trim() || "";
  const product_interest = productSelect?.value.trim() || "";
  const message = messageInput?.value.trim() || "";

  let isValid = true;

  if (!customer_name) {
    showFieldError(nameInput, "Nama wajib diisi");
    isValid = false;
  }

  if (!phone) {
    showFieldError(phoneInput, "Nomor HP wajib diisi");
    isValid = false;
  } else if (!validatePhone(phone)) {
    showFieldError(phoneInput, "Format nomor HP tidak valid");
    isValid = false;
  }

  if (!isValid) return;

  const payload = {
    customer_name,
    phone,
    product_interest,
    message
  };

  try {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Mengirim...`;
    }

    const result = await window.PublicAPI.sendInquiry(payload);

    if (typeof showToast === "function") {
      showToast(result.message || "Inquiry berhasil dikirim");
    }

    form.reset();
  } catch (error) {
    console.error("Submit inquiry error:", error);

    if (typeof showToast === "function") {
      showToast(error.message || "Gagal mengirim inquiry");
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = `<i class="bi bi-send-fill me-2"></i>Kirim Inquiry`;
    }
  }
}

function initInquiryForm() {
  const form = document.getElementById("inquiryForm");
  if (!form) return;

  form.addEventListener("submit", handleInquirySubmit);
}

window.PublicForm = {
  initInquiryForm
};