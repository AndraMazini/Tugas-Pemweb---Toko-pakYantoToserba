document.getElementById("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("inp-email").value.trim();
  const password = document.getElementById("inp-password").value;
  const errorDiv = document.getElementById("login-error");
  const btnLogin = document.getElementById("btn-login");

  errorDiv.classList.add("hidden");
  errorDiv.innerText = "";

  const originalText = btnLogin.textContent;
  btnLogin.disabled = true;
  btnLogin.textContent = "Sedang masuk...";

  try {
    if (!email || !password) {
      errorDiv.innerText = "Email dan password harus diisi!";
      errorDiv.classList.remove("hidden");
      return;
    }

    const result = await login(email, password);

    if (!result || !result.success) {
      errorDiv.innerText = result?.message || "Email atau password salah!";
      errorDiv.classList.remove("hidden");
      return;
    }

    const token = result.token || result.data?.token || "";
    const user = result.user || result.data?.user || result.data || {};
    const userRole = (user.role || "").toLowerCase();

    if (userRole === "admin" || userRole === "superadmin") {
      saveAdminToken(token);
      localStorage.setItem("admin_user", JSON.stringify(user));
      window.location.href = "./dashboard.html";
      return;
    }

    removeAdminToken();
    errorDiv.innerText = "Akun ini bukan admin.";
    errorDiv.classList.remove("hidden");
  } catch (err) {
    console.error("Login error:", err);
    errorDiv.innerText = err.message || "Gagal terhubung ke server backend.";
    errorDiv.classList.remove("hidden");
  } finally {
    btnLogin.disabled = false;
    btnLogin.textContent = originalText;
  }
});