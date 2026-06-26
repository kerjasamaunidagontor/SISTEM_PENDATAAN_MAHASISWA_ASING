/* ===============================
   GLOBAL API CONFIG
================================ */

window.API_BASE =
  "https://script.google.com/macros/s/AKfycbwxU-_wT3cT2c3hiOVSS1SuIuPIDazwODdGw9GoUusXhv1nMMHEbmjqQFotM1s_nvnX/exec";

/* ===============================
   ENDPOINT PER SHEET
================================ */

window.API = {
  mahasiswa: `${window.API_BASE}?sheet=DATA%20MAHASISWA`,
  mobility: `${window.API_BASE}?sheet=DATA%20MAHASISWA%20NON%20DEGREE`,
  penerimaan: `${window.API_BASE}?sheet=DATA%20CALON%20MAHASISWA%20ASING`,
};
