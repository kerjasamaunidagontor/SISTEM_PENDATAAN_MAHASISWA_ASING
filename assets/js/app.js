/* ==============================
   ROUTER
============================== */
function runPageScript(page) {
  if (page === "dashboard") {
    loadDashboardStats();
  }

  if (page === "kerjasama") {
    // bind elemen form lalu load data dari sheet
    bindKerjasamaForm();
    // pastikan dropdown negara dan benua terisi (tidak pakai await cukup panggil)
    loadBenuaDropdown();
    loadCountryDropdown();
    loadKerjasamaFromSheet();
  }

  if (page === "kegiatan") {
    // bind kegiatan form & render
    bindKegiatanForm();
    loadKegiatanFromSheet();
  }

  if (typeof loadMitraPage === "function") {
    loadMitraPage();
  }
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
  loadPage("dashboard");
});
