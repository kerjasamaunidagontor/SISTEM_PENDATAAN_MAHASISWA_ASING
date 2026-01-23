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
function loadUserSidebar() {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  if (!username || !role) return;

  document.getElementById("sidebarUsername").innerText = username;

  const roleBadge = document.getElementById("sidebarRole");
  roleBadge.innerText = role.toUpperCase();

  // warna badge
  if (role === "admin") {
    roleBadge.className =
      "text-xs px-2 py-0.5 rounded bg-purple-600 text-white";
  } else {
    roleBadge.className =
      "text-xs px-2 py-0.5 rounded bg-blue-500 text-white";
  }
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
let idleTimer;
const IDLE_LIMIT = 10 * 60 * 1000; // 10 menit
/* ============================
  untuk timer logout otomatis
============================== */
function resetIdleTimer() {
  clearTimeout(idleTimer);

  idleTimer = setTimeout(() => {
    alert("Session habis karena tidak ada aktivitas.");
    logout();
  }, IDLE_LIMIT);
}

function initIdleLogout() {
  ["mousemove", "keydown", "click", "scroll"].forEach(event => {
    document.addEventListener(event, resetIdleTimer);
  });

  resetIdleTimer();
}

/* ==============================
   INIT
============================== */
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  applyRoleUI();
  loadUserSidebar();
  renderUserInfo();   // 👤 tampilkan user
  initIdleLogout();
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

