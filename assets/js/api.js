/* ===============================
   GLOBAL API CONFIG
================================ */

window.API_BASE =
  "https://script.google.com/macros/s/AKfycby6eEFKYKlCH8lu1AEwXHoViRUNtxw0hf69BFG-MYx7IembhZTSOhzI2zQIHXxnF3pL/exec";

/* ===============================
   ENDPOINT PER SHEET
================================ */

window.API = {
  mahasiswa: `${window.API_BASE}?sheet=DATA%20MAHASISWA`,
  mobility: `${window.API_BASE}?sheet=DATA%20MAHASISWA%20NON%20DEGREE`,
  penerimaan: `${window.API_BASE}?sheet=DATA%20CALON%20MAHASISWA%20ASING`,
};
