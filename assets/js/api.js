/* ===============================
   GLOBAL API CONFIG
================================ */

window.API_BASE =
  "https://script.google.com/macros/s/AKfycbzPwrKJxvDzRPqVJ1aY3JEwGRVAEC2b6pCyqzS-tv3j2ViPGqvH3Qy4rF-Num5Gcxng/exec";

/* ===============================
   ENDPOINT PER SHEET
================================ */

window.API = {
  mahasiswa: `${window.API_BASE}?sheet=DATA%20MAHASISWA`,
  mobility: `${window.API_BASE}?sheet=DATA%20MAHASISWA%20NON%20DEGREE`,
  penerimaan: `${window.API_BASE}?sheet=DATA%20CALON%20MAHASISWA%20ASING`,
};
