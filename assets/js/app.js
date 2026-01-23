/* ==============================
   ROUTER
============================== */
/* ==============================
   AUTH CHECK
============================== */
function checkAuth() {
  const isLogin = localStorage.getItem("isLogin");
  if (!isLogin) {
    window.location.href = "pages/login.html";
  }
}

function getRole() {
  return localStorage.getItem("role"); // admin | user
}

function runPageScript(page) {
  const role = getRole();

  // proteksi halaman admin
  if (role !== "admin" && (page === "kerjasama" || page === "kegiatan")) {
    alert("Halaman ini hanya bisa diakses admin");
    loadPage("dashboard");
    return;
  }

  if (page === "dashboard") {
    loadDashboardStats();
  }

  if (page === "kerjasama") {
    bindKerjasamaForm();
    loadBenuaDropdown();
    loadCountryDropdown();
    loadKerjasamaFromSheet();
  }

  if (page === "kegiatan") {
    bindKegiatanForm();
    loadKegiatanFromSheet();
  }

  if (page === "mitra" && typeof loadMitraPage === "function") {
    loadMitraPage();
  }
}
function renderUserInfo() {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  if (!username || !role) return;

  document.getElementById("sidebarUsername").textContent = username;
  document.getElementById("sidebarRole").textContent = role;
}

function logout() {
  localStorage.clear();
  window.location.href = "pages/login.html";
}

/* ===============================
   FORMAT TANGGAL
================================= */
function formatTanggal(val) {
  if (!val) return "-";

  // kalau sudah Date
  if (val instanceof Date && !isNaN(val)) {
    return val.toLocaleDateString("id-ID");
  }

  // kalau number (serial spreadsheet)
  if (typeof val === "number") {
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isNaN(d) ? "-" : d.toLocaleDateString("id-ID");
  }

  // kalau string
  const d = new Date(val);
  return isNaN(d) ? "-" : d.toLocaleDateString("id-ID");
}

/* ==============================
   INIT
============================== */
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  applyRoleUI();
  renderUserInfo();   // 👤 tampilkan user
  loadPage("dashboard");
});


function applyRoleUI() {
  const role = getRole();

  if (role !== "admin") {
    document.querySelectorAll("[data-admin]").forEach(el => {
      el.style.display = "none";
    });
  }
}

