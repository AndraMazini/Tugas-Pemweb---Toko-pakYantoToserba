document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-user-login");
  const emailInput = document.getElementById("inp-user-email");
  const passwordInput = document.getElementById("inp-user-password");
  const errorDiv = document.getElementById("login-user-error");
  const infoName = document.getElementById("user-login-info-name");
  const loginBtn = document.getElementById("btn-user-login");

  if (!form) return;

  try {
    const user = JSON.parse(localStorage.getItem("user_user") || "null");
    if (user?.name && infoName) infoName.textContent = user.name;
  } catch (_) {}

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (errorDiv) {
      errorDiv.textContent = "";
      errorDiv.classList.add("hidden");
      errorDiv.classList.remove("show");
    }

    const email = emailInput?.value?.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
      if (errorDiv) {
        errorDiv.textContent = "Email dan password harus diisi!";
        errorDiv.classList.remove("hidden");
        errorDiv.classList.add("show");
      }
      return;
    }

    const originalText = loginBtn?.textContent;
    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.textContent = "Sedang masuk...";
    }

    try {
      const result = await login(email, password);

      const token = result?.token || result?.data?.token || "";
      const user = result?.user || result?.data?.user || result?.data || null;

      if (!result || result.success === false || !token || !user) {
        if (errorDiv) {
          errorDiv.textContent = result?.message || "Email atau password salah!";
          errorDiv.classList.remove("hidden");
          errorDiv.classList.add("show");
        }
        return;
      }

      localStorage.setItem("user_token", token);
      localStorage.setItem("user_user", JSON.stringify(user));

      if (infoName && user?.name) {
        infoName.textContent = user.name;
      }

      const nextUrl =
        sessionStorage.getItem("afterUserLoginRedirect") || "index.html";

      sessionStorage.removeItem("afterUserLoginRedirect");
      window.location.href = nextUrl;
    } catch (err) {
      console.error("User login error:", err);
      if (errorDiv) {
        errorDiv.textContent = err.message || "Gagal terhubung ke server backend.";
        errorDiv.classList.remove("hidden");
        errorDiv.classList.add("show");
      }
    } finally {
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = originalText || "Masuk";
      }
    }
  });
});