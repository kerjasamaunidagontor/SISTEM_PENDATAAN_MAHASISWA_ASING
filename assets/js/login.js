document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  // contoh validasi sederhana
  if (password !== "123456") {
    errorMsg.classList.remove("hidden");
    return;
  }

  let role = "user";

  // BEDAKAN ROLE DARI NAMA USER
  if (username.toLowerCase().startsWith("admin")) {
    role = "admin";
  }

  // simpan session
  localStorage.setItem("isLogin", "true");
  localStorage.setItem("username", username);
  localStorage.setItem("role", role);

  // redirect sesuai role
  if (role === "admin") {
    window.location.href = "../index.html"; // dashboard admin
  } else {
    window.location.href = "../index.html"; // dashboard user
  }
});
