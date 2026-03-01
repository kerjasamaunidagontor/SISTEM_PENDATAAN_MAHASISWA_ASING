/**
 * datamahasiswa.js - OPTIMIZED VERSION
 */

const API_URL = window.API.mahasiswa;

let students = [];
let currentPageNum = 1;
const itemsPerPage = 20; // 🔥 jangan 100

/* ===============================
   INIT
================================= */
async function initDatamahasiswa() {
  students = []; // reset dulu

  await loadStudentsFromAPI();
  await loadCountryDropdown();
  loadProdiDropdown();
  loadYearDropdown();

  document
    .getElementById("searchStudent")
    ?.addEventListener("input", debounceFilter);

  document
    .getElementById("filterCountry")
    ?.addEventListener("change", filterStudents);

  document
    .getElementById("studentForm")
    ?.addEventListener("submit", handleStudentSubmit);

  document
    .getElementById("itas_expired")
    ?.addEventListener("change", () =>
      updateStatusByExpired("itas_expired", "status_itas"),
    );

  document
    .getElementById("passport_expired")
    ?.addEventListener("change", () =>
      updateStatusByExpired("passport_expired", "status_passport"),
    );
}

/* ===============================
   LOAD DATA (OPTIMIZED)
================================= */
async function loadStudentsFromAPI() {
  try {
    const response = await fetch(`${API_URL}&action=getAll`);
    const result = await response.json();

    if (result.success) {
      students = result.data.map((s) => ({
        row: s.row, // 🔥 penting untuk update/delete
        kampus: s.kampus || "",
        nama: s.nama || "",
        negara: s.negara || "",
        nim: s.nim || "",
        prodi: s.prodi || "",
        semester: s.semester || "",
        tahun_masuk: s.tahun_masuk || "",
        passport_expired: s.passport_expired || "",
        status_passport: s.status_passport || "",
        itas_expired: s.itas_expired || "",
        status_itas: s.status_itas || "",
        guarantor: s.guarantor || "",
        siakad: s.siakad || "",
        foto: s.foto || "",
        file_passport: s.file_passport || "",
        file_itas: s.file_itas || "",
        file_loa: s.file_loa || "",
        reguler_kmi: s.reguler_kmi || "",
        status_beasiswa: s.status_beasiswa || "",
        fakultas: s.fakultas || "",
        jenis_kelamin: s.jenis_kelamin || "",
      }));

      renderStudentTable(1);
    }
  } catch (error) {
    console.error("Load Error:", error);
  }
}

/* ===============================
   RENDER TABLE (FAST)
================================= */
function renderStudentTable(page = 1) {
  const tbody = document.getElementById("studentTableBody");
  if (!tbody) return;

  currentPageNum = page;

  const filtered = getFilteredStudents();
  const start = (page - 1) * itemsPerPage;
  const paginated = filtered.slice(start, start + itemsPerPage);

  let html = "";

  for (let i = 0; i < paginated.length; i++) {
    const s = paginated[i];

    html += `
      <tr>
        <td>${start + i + 1}</td>
        <td>${s.nama}</td>
        <td>${s.nim}</td>
        <td>${s.negara}</td>
        <td>${s.prodi}</td>
        <td>${s.status || "-"}</td>
        <td class="space-x-2">
  <button 
    onclick="viewStudent(${s.row})"
    class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
  >
    Detail
  </button>

  <button 
    onclick="editStudent(${s.row})"
    class="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
  >
    Edit
  </button>

  <button 
    onclick="deleteStudent(${s.row})"
    class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
  >
    Hapus
  </button>
</td>
      </tr>
    `;
  }

  tbody.innerHTML = html;

  // Update info
  const showingStart = document.getElementById("showingStart");
  const showingEnd = document.getElementById("showingEnd");
  const totalRecords = document.getElementById("totalRecords");

  if (totalRecords) totalRecords.textContent = filtered.length;

  if (filtered.length > 0) {
    showingStart.textContent = start + 1;
    showingEnd.textContent = Math.min(start + itemsPerPage, filtered.length);
  } else {
    showingStart.textContent = 0;
    showingEnd.textContent = 0;
  }

  // Render pagination
  renderPagination(filtered.length);
}
/* ===============================
   PAGINATION
================================= */
function renderPagination(total) {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  const pageCount = Math.ceil(total / itemsPerPage);
  pagination.innerHTML = "";

  if (pageCount <= 1) return; // kalau cuma 1 halaman, ga usah tampil

  const maxVisible = 5;
  let start = Math.max(1, currentPageNum - Math.floor(maxVisible / 2));
  let end = Math.min(pageCount, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  // ⬅ Prev
  pagination.innerHTML += `
    <button onclick="goToStudentPage(${Math.max(1, currentPageNum - 1)})"
      class="px-3 py-1 border rounded-lg hover:bg-gray-100">
      ◀
    </button>
  `;

  // Page 1
  if (start > 1) {
    pagination.innerHTML += pageButton(1);
    if (start > 2) pagination.innerHTML += ellipsis();
  }

  // Middle pages
  for (let i = start; i <= end; i++) {
    pagination.innerHTML += pageButton(i);
  }

  // Last page
  if (end < pageCount) {
    if (end < pageCount - 1) pagination.innerHTML += ellipsis();
    pagination.innerHTML += pageButton(pageCount);
  }

  // Next ➡
  pagination.innerHTML += `
    <button onclick="goToStudentPage(${Math.min(
      pageCount,
      currentPageNum + 1,
    )})"
      class="px-3 py-1 border rounded-lg hover:bg-gray-100">
      ▶
    </button>
  `;
}

function pageButton(page) {
  return `
    <button onclick="goToStudentPage(${page})"
      class="px-3 py-1 rounded-lg border ${
        page === currentPageNum ? "bg-blue-600 text-white" : "hover:bg-gray-100"
      }">
      ${page}
    </button>
  `;
}

function ellipsis() {
  return `<span class="px-2 text-gray-400">...</span>`;
}

function goToStudentPage(page) {
  currentPageNum = page;
  renderStudentTable(page);
}
/* ===============================
   FILTER (LIGHT)
================================= */
function getFilteredStudents() {
  const search =
    document.getElementById("searchStudent")?.value?.toLowerCase() || "";
  const country =
    document.getElementById("filterCountry")?.value?.toLowerCase() || "";

  return students.filter((s) => {
    const name = String(s.nama || "").toLowerCase();
    const nim = String(s.nim || "").toLowerCase();
    const negara = String(s.negara || "").toLowerCase();

    return (
      (!search || name.includes(search) || nim.includes(search)) &&
      (!country || negara === country)
    );
  });
}

function filterStudents() {
  renderStudentTable(1);
}

/* ===============================
   SEARCH DEBOUNCE (BIAR GA BERAT)
================================= */
let debounceTimer;
function debounceFilter() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    renderStudentTable(1);
  }, 300);
}

/* ===============================
   MODAL
================================= */
function openStudentModal() {
  document.getElementById("modalTitle").innerText = "Tambah Mahasiswa";
  document.getElementById("studentModal").classList.remove("hidden");
  document.getElementById("studentModal").classList.add("flex");
}

function closeStudentModal() {
  document.getElementById("studentModal").classList.add("hidden");
  document.getElementById("studentModal").classList.remove("flex");
  document.getElementById("studentForm").reset();
  document.getElementById("studentId").value = "";
}

/* ===============================
   EDIT
================================= */
function editStudent(row) {
  const student = students.find((s) => s.row == row);
  if (!student) return;

  document.getElementById("modalTitle").innerText = "Edit Mahasiswa";

  document.getElementById("studentId").value = student.row;
  document.getElementById("kampus").value = student.kampus || "";
  document.getElementById("semester").value = student.semester || "";

  // === EXPIRED DATE (FORMAT FIX) ===
  document.getElementById("passport_expired").value = convertToDateInputFormat(
    student.passport_expired,
  );

  document.getElementById("itas_expired").value = convertToDateInputFormat(
    student.itas_expired,
  );

  document.getElementById("guarantor").value = student.guarantor || "";
  document.getElementById("siakad").value = student.siakad || "";
  document.getElementById("fakultas").value = student.fakultas || "";
  document.getElementById("jenis_kelamin").value = student.jenis_kelamin || "";

  document.getElementById("studentName").value = student.nama || "";
  document.getElementById("studentCountry").value = student.negara || "";
  document.getElementById("studentNim").value = student.nim || "";
  document.getElementById("studentProdi").value = student.prodi || "";
  document.getElementById("studentEntryDate").value = student.tahun_masuk || "";
  document.getElementById("studentStatus").value =
    student.status_beasiswa || "";

  document.getElementById("foto").value = student.foto || "";
  document.getElementById("file_passport").value = student.file_passport || "";
  document.getElementById("file_itas").value = student.file_itas || "";
  document.getElementById("file_loa").value = student.file_loa || "";

  // ===============================
  // 🔥 UPDATE STATUS OTOMATIS SETELAH DATE TERISI
  // ===============================
  setTimeout(() => {
    updateStatusByExpired("passport_expired", "status_passport");
    updateStatusByExpired("itas_expired", "status_itas");
  }, 100);

  openStudentModal();
}

/* ===============================
   CREATE / UPDATE
================================= */
async function handleStudentSubmit(e) {
  e.preventDefault();

  const row = document.getElementById("studentId").value;

  const payload = {
    action: row ? "update" : "create", // 🔥 PINDAH KE SINI
    sheet: "DATA MAHASISWA",          // 🔥 TAMBAHKAN INI
    row: row || "",

    kampus: document.getElementById("kampus").value || "UNIDA GONTOR",
    nama: document.getElementById("studentName").value,
    negara: document.getElementById("studentCountry").value,
    nim: document.getElementById("studentNim").value,
    prodi: document.getElementById("studentProdi").value,
    semester: document.getElementById("semester").value,
    tahun_masuk: document.getElementById("studentEntryDate").value,
    passport_expired: document.getElementById("passport_expired").value,
    status_passport: document.getElementById("status_passport").value,
    itas_expired: document.getElementById("itas_expired").value,
    status_itas: document.getElementById("status_itas").value,
    guarantor: document.getElementById("guarantor").value,
    siakad: document.getElementById("siakad").value,
    foto: document.getElementById("foto").value,
    file_passport: document.getElementById("file_passport").value,
    file_itas: document.getElementById("file_itas").value,
    file_loa: document.getElementById("file_loa").value,
    status_beasiswa: document.getElementById("studentStatus").value,
    fakultas: document.getElementById("fakultas").value,
    jenis_kelamin: document.getElementById("jenis_kelamin").value,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log(result);

    if (!result.success) {
      alert("ERROR: " + result.error);
      return;
    }

    closeStudentModal();
    await loadStudentsFromAPI();

  } catch (err) {
    console.error("Submit Error:", err);
  }
}
function viewStudent(row) {
  const student = students.find((s) => s.row == row);
  if (!student) return;

  // DATA UTAMA
  document.getElementById("viewDataUtama").innerHTML = `
    <div><strong>Nama:</strong> ${student.nama}</div>
    <div><strong>NIM:</strong> ${student.nim}</div>
    <div><strong>Negara:</strong> ${student.negara}</div>
    <div><strong>Prodi:</strong> ${student.prodi}</div>
    <div><strong>Tahun Masuk:</strong> ${student.tahun_masuk}</div>
  `;

  // DATA AKADEMIK
  document.getElementById("viewDataAkademik").innerHTML = `
    <div><strong>Kampus:</strong> ${student.kampus || "-"}</div>
    <div><strong>Semester:</strong> ${student.semester || "-"}</div>
    <div><strong>Fakultas:</strong> ${student.fakultas || "-"}</div>
    <div><strong>Jenis Kelamin:</strong> ${student.jenis_kelamin || "-"}</div>
    <div><strong>Siakad:</strong> ${student.siakad || "-"}</div>
    <div><strong>Status Beasiswa:</strong> ${student.status_beasiswa || "-"}</div>
  `;

  // DOKUMEN LEGAL
  document.getElementById("viewDataLegal").innerHTML = `
    <div><strong>Passport Expired:</strong> ${student.passport_expired || "-"}</div>
    <div><strong>Status Passport:</strong> ${student.status_passport || "-"}</div>
    <div><strong>ITAS Expired:</strong> ${student.itas_expired || "-"}</div>
    <div><strong>Status ITAS:</strong> ${student.status_itas || "-"}</div>
    <div><strong>Guarantor:</strong> ${student.guarantor || "-"}</div>
  `;

  // FILE
  document.getElementById("viewDataFiles").innerHTML = `
    <div><strong>Foto:</strong> ${student.foto ? `<a href="${student.foto}" target="_blank" class="text-blue-600 underline">Lihat</a>` : "-"}</div>
    <div><strong>Passport:</strong> ${student.file_passport ? `<a href="${student.file_passport}" target="_blank" class="text-blue-600 underline">Lihat</a>` : "-"}</div>
    <div><strong>ITAS:</strong> ${student.file_itas ? `<a href="${student.file_itas}" target="_blank" class="text-blue-600 underline">Lihat</a>` : "-"}</div>
    <div><strong>LOA:</strong> ${student.file_loa ? `<a href="${student.file_loa}" target="_blank" class="text-blue-600 underline">Lihat</a>` : "-"}</div>
  `;

  document.getElementById("viewStudentModal").classList.remove("hidden");
  document.getElementById("viewStudentModal").classList.add("flex");
}
function closeViewStudent() {
  document.getElementById("viewStudentModal").classList.add("hidden");
  document.getElementById("viewStudentModal").classList.remove("flex");
}
function loadYearDropdown() {
  const select = document.getElementById("studentEntryDate");
  if (!select) return;

  const currentYear = new Date().getFullYear();

  for (let y = currentYear; y >= 1990; y--) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    select.appendChild(option);
  }
}
/* ===============================
  load country dropdown static list
================================= */
async function loadCountryDropdown(force = false) {
  const select = document.getElementById("studentCountry");
  if (!select) return;

  if (!force && select.options.length > 1) return;

  const COUNTRY_LIST = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Argentina",
    "Australia",
    "Austria",
    "Bangladesh",
    "Belgium",
    "Brazil",
    "Brunei Darussalam",
    "Cambodia",
    "Canada",
    "Chad",
    "China",
    "Denmark",
    "Egypt",
    "France",
    "Germany",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Italy",
    "Japan",
    "Jordan",
    "Kenya",
    "Kuwait",
    "Laos",
    "Malaysia",
    "Mexico",
    "Morocco",
    "Myanmar",
    "Netherlands",
    "New Zealand",
    "Nigeria",
    "Norway",
    "Pakistan",
    "Philippines",
    "Qatar",
    "Russia",
    "Saudi Arabia",
    "Singapore",
    "South Africa",
    "South Korea",
    "Spain",
    "Sri Lanka",
    "Sweden",
    "Switzerland",
    "Thailand",
    "Turkey",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Vietnam",
    "Yemen",
    "Zimbabwe",
  ];

  COUNTRY_LIST.sort();

  select.innerHTML = `<option value="">-- Pilih Negara --</option>`;

  COUNTRY_LIST.forEach((country) => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    select.appendChild(option);
  });
}
/* ===============================
  load prodi dropdown static list
================================= */
function loadProdiDropdown(force = false) {
  const select = document.getElementById("studentProdi");
  if (!select) return;

  // Kalau sudah terisi dan tidak dipaksa, skip
  if (!force && select.options.length > 1) return;

  const PRODI_LIST = [
    "Pendidikan Agama Islam",
    "Pendidikan Bahasa Arab",
    "Tadris Bahasa Inggris",
    "Hukum Ekonomi Syariah",
    "Perbandingan Madzhab dan Hukum",
    "Studi Agama-Agama",
    "Ilmu Al-Qur'an dan Tafsir",
    "Aqidah dan Filsafat Islam",
    "Ekonomi Islam",
    "Manajemen",
    "Teknik Informatika",
    "Agroteknologi",
    "Teknologi Industri Pertanian",
    "Farmasi",
    "Ilmu Gizi",
    "Keselamatan dan Kesehatan Kerja",
    "Hubungan Internasional",
    "Ilmu Komunikasi",
    "Magister Pendidikan Bahasa Arab",
    "Magister Aqidah dan Filsafat Islam",
    "Magister Hukum Ekonomi Syariah",
    "Doktor Aqidah dan Filsafat Islam",
    "Magister Ilmu Al-Qur'an dan Tafsir",
    "Magister Pendidikan Agama Islam",
  ];

  // Reset isi kecuali option pertama
  select.innerHTML = `<option value="">Pilih Program Studi</option>`;

  PRODI_LIST.forEach((prodi) => {
    const option = document.createElement("option");
    option.value = prodi;
    option.textContent = prodi;
    select.appendChild(option);
  });
}
/* ===============================
  UPDATE STATUS ITAS OTOMATIS
================================= */
function updateStatusByExpired(expiredId, statusId) {
  const expiredInput = document.getElementById(expiredId).value;
  const statusSelect = document.getElementById(statusId);

  if (!expiredInput) {
    statusSelect.value = "Tidak Aktif";
    return;
  }

  const today = new Date();
  const expiredDate = new Date(expiredInput);

  today.setHours(0, 0, 0, 0);
  expiredDate.setHours(0, 0, 0, 0);

  if (expiredDate < today) {
    statusSelect.value = "Tidak Aktif";
    return;
  }

  // === HITUNG SELISIH ===
  let years = expiredDate.getFullYear() - today.getFullYear();
  let months = expiredDate.getMonth() - today.getMonth();
  let days = expiredDate.getDate() - today.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(
      expiredDate.getFullYear(),
      expiredDate.getMonth(),
      0,
    );
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const result = `${years} Tahun ${months} Bulan ${days} Hari`;

  // 🔥 Tambahkan option baru TANPA menghapus yang lama
  let existingOption = Array.from(statusSelect.options).find(
    (opt) => opt.value === result,
  );

  if (!existingOption) {
    const newOption = document.createElement("option");
    newOption.value = result;
    newOption.textContent = result;
    statusSelect.appendChild(newOption);
  }

  statusSelect.value = result;
}
/* ===============================
   FORMAT TANGGAL
================================= */
function convertToDateInputFormat(dateStr) {
  if (!dateStr) return "";

  // Kalau sudah yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Coba parse otomatis
  const parsed = new Date(dateStr);

  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return "";
}
/* ===============================
   DELETE
================================= */
async function deleteStudent(row) {
  if (!confirm("Hapus data mahasiswa ini?")) return;

  try {
    await fetch(API_URL, {
  method: "POST",
  body: JSON.stringify({
    action: "delete",
    sheet: "DATA MAHASISWA",
    row: row
  }),
});

    await loadStudentsFromAPI();
  } catch (err) {
    console.error("Delete Error:", err);
  }
}
function getTotalStudents() {
  return students.length;
}
