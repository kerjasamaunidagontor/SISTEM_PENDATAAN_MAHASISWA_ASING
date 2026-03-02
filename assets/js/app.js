/**
 * app.js - Core functions for Student Data System
 * Handles: sidebar toggle, page loading, user menu, auth
 */

// Global state
let currentPage = "dashboard";
let userData = {
  username: "Admin",
  role: "Administrator",
};

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  // Set user info in UI
  document.getElementById("sidebarUsername").textContent = userData.username;
  document.getElementById("sidebarRole").textContent = userData.role;
  document.getElementById("headerUsername").textContent = userData.username;
  document.getElementById("headerRole").textContent = userData.role;

  // Load default page
  loadPage("dashboard");

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    const userMenu = document.getElementById("userDropdown");
    const userBtn = e.target.closest('button[onclick="toggleUserMenu()"]');
    if (!userBtn && userMenu && !userMenu.classList.contains("hidden")) {
      userMenu.classList.add("hidden");
    }
  });
}

// Toggle sidebar (mobile)
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const isClosed = sidebar.classList.contains("-translate-x-full");

  if (isClosed) {
    sidebar.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
  } else {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
  }
}

// Toggle sidebar dropdowns
function toggleSidebarDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.classList.toggle("hidden");
}

// Toggle user menu dropdown
function toggleUserMenu() {
  const menu = document.getElementById("userDropdown");
  menu.classList.toggle("hidden");
}

// Load page content dynamically
async function loadPage(pageName) {
  // Update active menu
  document.querySelectorAll(".menu-link").forEach((link) => {
    link.classList.remove("active");
  });
  event?.target?.closest?.(".menu-link")?.classList?.add("active");

  // Update page title
  const titles = {
    dashboard: "Dashboard",
    datamahasiswa: "Data Mahasiswa",
    mobility: "Mobilitas Internasional",
    penerimaan: "Data Penerimaan Baru",
  };
  document.getElementById("page-title").textContent =
    titles[pageName] || "Dashboard";
  currentPage = pageName;

  // Show loading
  showLoading(true);

  try {
    // Fetch page content
    const response = await fetch(`pages/${pageName}.html`);
    if (!response.ok) throw new Error(`Page not found: ${pageName}`);

    const html = await response.text();
    document.getElementById("app-content").innerHTML = html;

    // Initialize page-specific JS
    if (typeof window[`init${capitalize(pageName)}`] === "function") {
      window[`init${capitalize(pageName)}`]();
    }

    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  } catch (error) {
    console.error("Error loading page:", error);
    document.getElementById("app-content").innerHTML =
      `<div class="text-center py-10 text-red-600">❌ Gagal memuat halaman: ${error.message}</div>`;
  } finally {
    showLoading(false);
  }
}

// Helper: capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Show/hide global loading
function showLoading(show, message = "Memproses...") {
  const loading = document.getElementById("global-loading");
  const text = document.getElementById("global-loading-text");
  text.textContent = message;

  if (show) {
    loading.classList.remove("hidden");
    loading.classList.add("flex");
  } else {
    loading.classList.add("hidden");
    loading.classList.remove("flex");
  }
}

// Logout function
function logout() {
  if (confirm("Apakah Anda yakin ingin logout?")) {
    // Clear session/storage if needed
    // Redirect to login page
    window.location.href = "login.html";
  }
}

// Open profile modal (placeholder)
function openProfile() {
  alert("Fitur profile akan segera tersedia!");
}

// Utility: format date
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Utility: generate ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
// Tambahkan di app.js
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === "success" ? "✅" : type === "error" ? "❌" : "⚠️"}</span>
    <span class="message">${message}</span>
    <button class="close" onclick="this.parentElement.remove()">&times;</button>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
