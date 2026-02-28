/* ===============================
   GLOBAL API CONFIG
================================ */

window.API_BASE =
  "https://script.google.com/macros/s/AKfycbyBNQZfvkVB1_Jai4P-oxlFFEqdqCyn8eHYL7ELp1yhhv8RCvVnLQ97WLky93lPg44x/exec";

/* ===============================
   ENDPOINT PER SHEET
================================ */

window.API = {
  mahasiswa: `${window.API_BASE}?sheet=DATA%20MAHASISWA`,
  mobility: `${window.API_BASE}?sheet=DATA%20MAHASISWA%20NON%20DEGREE`,
  penerimaan: `${window.API_BASE}?sheet=DATA%20CALON%20MAHASISWA%20ASING`,
};
