/**
 * datamahasiswa.js - OPTIMIZED VERSION
 */

const API_URL = window.API.mahasiswa;

let students = [];
let currentPageNum = 1;
const itemsPerPage = 20; // 🔥 jangan 100
// 🔥 TAMBAHKAN DI ATAS FILE, setelah deklarasi variabel lain
let originalStudentStatus = ""; // Untuk tracking status awal saat edit

/* ===============================
   INIT
================================= */
async function initDatamahasiswa() {
  students = [];

  await loadStudentsFromAPI();
  await loadCountryDropdown();
  loadProdiDropdown();
  loadYearDropdown();

  document.getElementById("searchStudent")?.addEventListener("input", debounceFilter);
  document.getElementById("filterCountry")?.addEventListener("change", filterStudents);
  document.getElementById("studentForm")?.addEventListener("submit", handleStudentSubmit);
  
  document.getElementById("itas_expired")?.addEventListener("change", () =>
    updateStatusByExpired("itas_expired", "status_itas")
  );
  
  document.getElementById("passport_expired")?.addEventListener("change", () =>
    updateStatusByExpired("passport_expired", "status_passport")
  );
  
  document.getElementById("filterProdi")?.addEventListener("change", filterStudents);
  
  // 🔥 Auto-update semester saat tahun masuk atau status berubah
  document.getElementById('studentEntryDate')?.addEventListener('change', updateSemesterField);
  document.getElementById('studentStatus')?.addEventListener('change', updateSemesterField);
  
  // Tambahkan listener untuk field martikulasi
  document.getElementById('martikulasiHistory')?.addEventListener('change', updateSemesterField);
  document.getElementById('firstActivationDate')?.addEventListener('change', updateSemesterField);
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
  row: s.row,
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
  martikulasi_history: s.martikulasi_history || "",
  first_activation_date: s.first_activation_date || "",
  // 🔥 TAMBAH FIELD CUTI
  cuti_start_date: s.cuti_start_date || "",
  cuti_history: s.cuti_history || "",
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
    
    // ✅ HAPUS auto-calc di sini, tidak perlu
    // Langsung tampilkan data dari database
    const displaySemester = s.semester || '-';

    html += `
      <tr>
        <td>${start + i + 1}</td>
        <td>${s.nama}</td>
        <td>${s.nim}</td>
        <td>${s.negara}</td>
        <td>${s.prodi}</td>
        <td>${s.status_beasiswa || "-"}</td>
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
  const keyword =
    document.getElementById("searchStudent")?.value?.toLowerCase().trim() || "";

  return students.filter((s) => {
    const name = String(s.nama || "").toLowerCase();
    const nim = String(s.nim || "").toLowerCase();
    const negara = String(s.negara || "").toLowerCase();
    const prodi = String(s.prodi || "").toLowerCase();

    return (
      !keyword ||
      name.includes(keyword) ||
      nim.includes(keyword) ||
      negara.includes(keyword) ||
      prodi.includes(keyword)
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
   EDIT - FIXED VERSION
================================= */
function editStudent(row) {
  const student = students.find((s) => s.row == row);
  if (!student) return;

  originalStudentStatus = student.status_beasiswa?.toLowerCase() || "";

  document.getElementById("modalTitle").innerText = "Edit Mahasiswa";
  document.getElementById("studentId").value = student.row;
  document.getElementById("kampus").value = student.kampus || "";
  
  const savedSemester = student.semester || "";
  document.getElementById("semester").value = savedSemester;
  document.getElementById("semesterValue").value = savedSemester;
  
  const semesterInput = document.getElementById("semester");
  if (typeof savedSemester === 'string' && isNaN(savedSemester)) {
    semesterInput.classList.add('bg-gray-100', 'text-gray-600', 'font-medium');
  } else {
    semesterInput.classList.remove('bg-gray-100', 'text-gray-600', 'font-medium');
  }

  // Load tracking fields
  document.getElementById('martikulasiHistory').value = student.martikulasi_history || "";
  document.getElementById('firstActivationDate').value = student.first_activation_date || "";
  document.getElementById('cutiStartDate').value = student.cuti_start_date || "";
  document.getElementById('cutiHistory').value = student.cuti_history || "";

  // Field lainnya
  document.getElementById("passport_expired").value = convertToDateInputFormat(student.passport_expired);
  document.getElementById("itas_expired").value = convertToDateInputFormat(student.itas_expired);
  document.getElementById("guarantor").value = student.guarantor || "";
  document.getElementById("siakad").value = student.siakad || "";
  document.getElementById("fakultas").value = student.fakultas || "";
  document.getElementById("jenis_kelamin").value = student.jenis_kelamin || "";
  document.getElementById("studentName").value = student.nama || "";
  document.getElementById("studentCountry").value = student.negara || "";
  document.getElementById("studentNim").value = student.nim || "";
  document.getElementById("studentProdi").value = student.prodi || "";
  document.getElementById("studentEntryDate").value = student.tahun_masuk || "";
  document.getElementById("studentStatus").value = student.status_beasiswa || "";
  document.getElementById("foto").value = student.foto || "";
  document.getElementById("file_passport").value = student.file_passport || "";
  document.getElementById("file_itas").value = student.file_itas || "";
  document.getElementById("file_loa").value = student.file_loa || "";

  setTimeout(() => {
    updateStatusByExpired("passport_expired", "status_passport");
    updateStatusByExpired("itas_expired", "status_itas");
    // Jangan auto-calc semester
  }, 100);

  openStudentModal();
}

/* ===============================
   CREATE / UPDATE
================================= */
async function handleStudentSubmit(e) {
  e.preventDefault();

  const form = document.getElementById("studentForm");
  const submitBtn = form.querySelector("button[type='submit']");
  const row = document.getElementById("studentId").value;

  if (submitBtn.disabled) return;

  const entryYear = parseInt(document.getElementById('studentEntryDate').value);
  const status = document.getElementById('studentStatus').value;
  const savedSemester = document.getElementById('semesterValue')?.value || "";
  const martikulasiHistory = document.getElementById('martikulasiHistory')?.value || "";
  const firstActivationDate = document.getElementById('firstActivationDate')?.value || "";
  
  try {
    // ✅ PERBAIKI - tambahkan originalStudentStatus
    const calcResult = await calculateAutoSemester(
      entryYear, 
      status, 
      originalStudentStatus,  // ← PARAMETER BARU
      savedSemester,
      martikulasiHistory,
      firstActivationDate
    );
    
    const semesterInput = document.getElementById('semester');
    const semesterHidden = document.getElementById('semesterValue');
    
    semesterInput.value = calcResult.semester;
    if (semesterHidden) semesterHidden.value = calcResult.semester;
    
    // Update hidden fields
    if (calcResult.firstActivationDate && document.getElementById('firstActivationDate')) {
      document.getElementById('firstActivationDate').value = calcResult.firstActivationDate;
    }
    if (calcResult.history && document.getElementById('martikulasiHistory')) {
      document.getElementById('martikulasiHistory').value = calcResult.history;
    }
    
  } catch (e) {
    console.warn('Gagal auto-calc semester:', e);
  }

  submitBtn.disabled = true;
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = "⏳ Menyimpan...";

  const payload = {
    action: row ? "update" : "create",
    sheet: "DATA MAHASISWA",
    row: row || "",
    kampus: document.getElementById("kampus").value || "UNIDA GONTOR",
    nama: document.getElementById("studentName").value,
    negara: document.getElementById("studentCountry").value,
    nim: document.getElementById("studentNim").value,
    prodi: document.getElementById("studentProdi").value,
    semester: document.getElementById('semesterValue')?.value || document.getElementById('semester')?.value,
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
    // Tambahkan field baru
    martikulasi_history: document.getElementById('martikulasiHistory')?.value || "",
    first_activation_date: document.getElementById('firstActivationDate')?.value || ""
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log(result);

    if (!result.success) {
      throw new Error(result.error || "Gagal menyimpan data");
    }

    await loadStudentsFromAPI();
    closeStudentModal();
    originalStudentStatus = ""; // ✅ Reset setelah save
    alert(row ? "✅ Data mahasiswa berhasil diupdate!" : "✅ Data mahasiswa berhasil ditambahkan!");
  } catch (err) {
    console.error("Submit Error:", err);
    alert("❌ Terjadi kesalahan saat menyimpan data");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
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
    <div><strong>Status Mahasiswa:</strong> ${student.siakad || "-"}</div>
    <div><strong>Siakad:</strong> ${student.status_beasiswa || "-"}</div>
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
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei Darussalam",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Congo",
    "Costa Rica",
    "Côte d’Ivoire",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Democratic Republic of the Congo",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Holy See",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "North Korea",
    "North Macedonia",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestine",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Korea",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Syria",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
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
        row: row,
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
// === DOWNLOAD FILE === //
function getExportData() {
  return getFilteredStudents(); // 🔥 export sesuai filter & search aktif
}
function downloadStudentCSV() {
  const data = getExportData();
  if (!data.length) return alert("Tidak ada data");

  const headers = [
    "Nama",
    "NIM",
    "Negara",
    "Prodi",
    "Tahun Masuk",
    "Status Beasiswa",
  ];

  const rows = data.map((s) => [
    s.nama,
    s.nim,
    s.negara,
    s.prodi,
    s.tahun_masuk,
    s.status_beasiswa,
  ]);

  let csvContent =
    headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Data_Mahasiswa_UNIDA.csv";
  link.click();
}
function downloadStudentExcel() {
  const data = getExportData();
  if (!data.length) return alert("Tidak ada data");

  let table = `
    <table>
      <tr>
        <th>Nama</th>
        <th>NIM</th>
        <th>Negara</th>
        <th>Prodi</th>
        <th>Tahun Masuk</th>
        <th>Status</th>
      </tr>
  `;

  data.forEach((s) => {
    table += `
      <tr>
        <td>${s.nama}</td>
        <td>${s.nim}</td>
        <td>${s.negara}</td>
        <td>${s.prodi}</td>
        <td>${s.tahun_masuk}</td>
        <td>${s.status_beasiswa}</td>
      </tr>
    `;
  });

  table += "</table>";

  const blob = new Blob([table], {
    type: "application/vnd.ms-excel",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Data_Mahasiswa_UNIDA.xls";
  link.click();
}
function downloadStudentPDF() {
  const data = getExportData();
  if (!data.length) return alert("Tidak ada data");

  let html = `
    <html>
    <head>
      <title>Data Mahasiswa</title>
      <style>
        body { font-family: Arial; padding:20px; }
        table { border-collapse: collapse; width:100%; }
        th, td { border:1px solid #ddd; padding:8px; font-size:12px; }
        th { background:#2563EB; color:white; }
      </style>
    </head>
    <body>
      <h2>Data Mahasiswa UNIDA Gontor</h2>
      <table>
        <tr>
          <th>Nama</th>
          <th>NIM</th>
          <th>Negara</th>
          <th>Prodi</th>
          <th>Tahun</th>
          <th>Status</th>
        </tr>
  `;

  data.forEach((s) => {
    html += `
      <tr>
        <td>${s.nama}</td>
        <td>${s.nim}</td>
        <td>${s.negara}</td>
        <td>${s.prodi}</td>
        <td>${s.tahun_masuk}</td>
        <td>${s.status_beasiswa}</td>
      </tr>
    `;
  });

  html += `
      </table>
    </body>
    </html>
  `;

  const win = window.open("", "", "width=900,height=700");
  win.document.write(html);
  win.document.close();
  win.print();
}
/**
 * ===============================
 * HIJRIYAH SEMESTER CALCULATOR
 * ===============================
 */

// Mapping nama bulan Hijriyah
const HIJRI_MONTHS = {
  1: 'Muharram', 2: 'Safar', 3: 'Rabiul Awal', 4: 'Rabiul Akhir',
  5: 'Jumadil Awal', 6: 'Jumadil Akhir', 7: 'Rajab', 8: "Sya'ban",
  9: 'Ramadhan', 10: 'Syawwal', 11: "Dzulqo'dah", 12: "Dzulhijjah"
};

// Bulan untuk periode Ganjil (Odd Semester Period)
const ODD_PERIOD_MONTHS = [10, 11, 12, 1, 2, 3]; // Syawwal → Rabiul Awal

/**
 * Konversi Gregorian ke Hijriyah (menggunakan API Aladhan)
 * @param {Date} date - Date object Gregorian
 * @returns {Promise<Object>} - { year, month, day, monthName }
 */
async function getHijriDate(date) {
  try {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    
    const response = await fetch(
      `https://api.aladhan.com/v1/gToH?date=${d}-${m}-${y}&adjustment=0`
    );
    const data = await response.json();
    
    if (data.code === 200) {
      const h = data.data.hijri;
      return {
        year: parseInt(h.year),
        month: parseInt(h.month.number),
        day: parseInt(h.day),
        monthName: h.month.en
      };
    }
  } catch (e) {
    console.warn('Gagal fetch Hijri date, pakai fallback:', e);
  }
  
  // Fallback: konversi sederhana (±2-3 hari error)
  return gregorianToHijriFallback(date);
}

/**
 * Fallback konversi sederhana jika API gagal
 */
function gregorianToHijriFallback(gDate) {
  const jd = gDateToJulian(gDate);
  const hijri = julianToHijri(jd);
  return {
    year: hijri.year,
    month: hijri.month,
    day: hijri.day,
    monthName: HIJRI_MONTHS[hijri.month] || ''
  };
}

function gDateToJulian(gd) {
  let y = gd.getFullYear(), m = gd.getMonth() + 1, d = gd.getDate();
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

function julianToHijri(jd) {
  const l = Math.floor(jd + 0.5) + 13;
  const n = Math.floor((l - 122.1) / 354.367);
  const r = l - Math.floor(354.367 * n);
  const y = n + 30;
  const m = Math.ceil((r - 29.5) / 29.5);
  const d = Math.floor(r - 29.5 * (m - 1));
  return { year: y, month: Math.min(12, Math.max(1, m)), day: Math.min(30, Math.max(1, d)) };
}

/**
 * Cek apakah bulan Hijriyah termasuk periode Ganjil
 */
function isOddPeriod(hijriMonth) {
  return ODD_PERIOD_MONTHS.includes(hijriMonth);
}

/**
 * 🔥 Hitung Semester Otomatis - LOGIKA BARU
 * @param {number} entryYear - Tahun masuk
 * @param {string} currentStatus - Status SAAT INI (dari form)
 * @param {string} originalStatus - Status AWAL dari database (untuk deteksi transisi)
 * @param {string} savedSemester - Nilai semester dari DB
 * @param {string} martikulasiHistory - Riwayat martikulasi (JSON string)
 * @param {string} firstActivationDate - Tanggal aktivasi pertama
 */
async function calculateAutoSemester(entryYear, currentStatus, originalStatus = "", savedSemester = "", martikulasiHistory = "", firstActivationDate = "", cutiStartDate = "", cutiHistory = "") {
  const currentStatusLower = currentStatus?.toLowerCase();
  const originalStatusLower = originalStatus?.toLowerCase();
  
  // 🟢 Status khusus → return teks
  if (currentStatusLower === 'martikulasi') {
    return { semester: 'Martikulasi', firstActivationDate, history: martikulasiHistory, cutiStartDate, cutiHistory };
  }
  if (currentStatusLower === 'lulus') {
    return { semester: 'Lulus', firstActivationDate, history: martikulasiHistory, cutiStartDate, cutiHistory };
  }
  // 🔴 TAMBAHAN: Status Non-Aktif → return teks "Non-Aktif"
  if (currentStatusLower === 'nonaktif') {
    return { 
      semester: 'Non-Aktif', 
      firstActivationDate, 
      history: martikulasiHistory, 
      cutiStartDate, 
      cutiHistory 
    };
  }
  // 🟡 STATUS CUTI - Bekukan semester
  if (currentStatusLower === 'cuti') {
    // Jika baru cuti (sebelumnya aktif), simpan tanggal mulai cuti
    let newCutiStartDate = cutiStartDate;
    if (originalStatusLower === 'aktif' && !cutiStartDate) {
      newCutiStartDate = new Date().toISOString().split('T')[0];
      
      // Tambah ke history cuti
      const history = cutiHistory ? JSON.parse(cutiHistory) : [];
      history.push({
        date: newCutiStartDate,
        type: 'cuti_start',
        semester: savedSemester
      });
      cutiHistory = JSON.stringify(history);
    }
    
    return { 
      semester: savedSemester || 1, // Pertahankan semester terakhir
      firstActivationDate, 
      history: martikulasiHistory,
      cutiStartDate: newCutiStartDate,
      cutiHistory
    };
  }
  
  // 🟢 KEMBALI DARI CUTI - FIXED
if (currentStatusLower === 'aktif' && originalStatusLower === 'cuti') {
  // Tambah ke history
  const history = cutiHistory ? JSON.parse(cutiHistory) : [];
  history.push({
    date: new Date().toISOString().split('T')[0],
    type: 'cuti_end',
    semester: savedSemester,
    note: 'Kembali dari cuti - semester dilanjutkan'
  });
  
  // ✅ PENTING: Saat kembali dari cuti, SEMESTER TETAP sama seperti saat cuti
  // Jangan recalculate dari firstActivationDate karena akan loncat!
  // Biarkan semester tetap di nilai terakhir sebelum cuti
  const frozenSemester = parseInt(savedSemester) || 1;
  
  return { 
    semester: frozenSemester,  // ← Tetap gunakan semester yang dibekukan
    firstActivationDate,       // ← firstActivationDate tetap (untuk hitungan future)
    history: martikulasiHistory,
    cutiStartDate: "",         // ← Clear cuti start date
    cutiHistory: JSON.stringify(history)
  };
}
  
  // 🔴 TRANSISI: Martikulasi → Aktif
  if (originalStatusLower === 'martikulasi' && currentStatusLower === 'aktif') {
    const today = new Date().toISOString().split('T')[0];
    const activationDate = firstActivationDate || today;
    
    const history = martikulasiHistory ? JSON.parse(martikulasiHistory) : [];
    history.push({
      date: today,
      type: 'activation',
      from: 'Martikulasi',
      to: 'Aktif'
    });
    
    return { 
      semester: 1, 
      firstActivationDate: activationDate,
      history: JSON.stringify(history),
      cutiStartDate,
      cutiHistory
    };
  }
  
  // 🔵 NORMAL: Mahasiswa aktif (bukan transisi dari martikulasi/cuti)
if (currentStatusLower === 'aktif' && originalStatusLower !== 'martikulasi' && originalStatusLower !== 'cuti') {
  let baseDate;
  
  if (firstActivationDate) {
    baseDate = new Date(firstActivationDate);
  } else if (entryYear) {
    baseDate = new Date(entryYear, 0, 1);
  } else {
    return { 
      semester: 1, 
      firstActivationDate, 
      history: martikulasiHistory,
      cutiStartDate,
      cutiHistory
    };
  }
  
  try {
    const hijriNow = await getHijriDate(new Date());
    const hijriBase = await getHijriDate(baseDate);
    
    const currentHijriYear = hijriNow.year;
    const currentHijriMonth = hijriNow.month;
    const baseHijriYear = hijriBase.year;
    const baseHijriMonth = hijriBase.month;
    
    let yearDiff = currentHijriYear - baseHijriYear;
    let semester = yearDiff * 2;
    
    const isNowOdd = isOddPeriod(currentHijriMonth);
    
    if (yearDiff === 0) {
      semester = isNowOdd ? 1 : 2;
    } else {
      semester += isNowOdd ? 1 : 2;
    }
    
    semester = Math.max(1, Math.min(14, semester));
    
    return { 
      semester: semester, 
      firstActivationDate,
      history: martikulasiHistory,
      cutiStartDate,
      cutiHistory
    };
  } catch (e) {
    console.error('Error calculating hijri semester:', e);
    return { 
      semester: 1, 
      firstActivationDate, 
      history: martikulasiHistory,
      cutiStartDate,
      cutiHistory
    };
  }
}
  
  // Default fallback
  return { 
    semester: 1, 
    firstActivationDate, 
    history: martikulasiHistory,
    cutiStartDate,
    cutiHistory
  };
}

/**
 * Update field semester di form secara otomatis
 */
async function updateSemesterField() {
  const entryYear = parseInt(document.getElementById('studentEntryDate')?.value);
  const currentStatus = document.getElementById('studentStatus')?.value;
  const semesterInput = document.getElementById('semester');
  const semesterHidden = document.getElementById('semesterValue');
  const martikulasiHistoryInput = document.getElementById('martikulasiHistory');
  const firstActivationInput = document.getElementById('firstActivationDate');
  const cutiStartDateInput = document.getElementById('cutiStartDate');
  const cutiHistoryInput = document.getElementById('cutiHistory');
  
  if (!semesterInput) return;
  
  semesterInput.placeholder = 'Menghitung...';
  semesterInput.disabled = true;
  
  try {
    const savedSemester = semesterInput.value || semesterHidden?.value || "";
    const martikulasiHistory = martikulasiHistoryInput?.value || "";
    const firstActivationDate = firstActivationInput?.value || "";
    const cutiStartDate = cutiStartDateInput?.value || "";
    const cutiHistory = cutiHistoryInput?.value || "";
    
    const result = await calculateAutoSemester(
      entryYear, 
      currentStatus,
      originalStudentStatus,
      savedSemester, 
      martikulasiHistory,
      firstActivationDate,
      cutiStartDate,
      cutiHistory
    );
    
    // Update semester
    const semesterValue = result.semester;
    semesterInput.value = semesterValue;
    if (semesterHidden) semesterHidden.value = semesterValue;
    
    // Update hidden fields
    if (result.firstActivationDate && firstActivationInput) {
      firstActivationInput.value = result.firstActivationDate;
    }
    if (result.history && martikulasiHistoryInput) {
      martikulasiHistoryInput.value = result.history;
    }
    if (result.cutiStartDate !== undefined && cutiStartDateInput) {
      cutiStartDateInput.value = result.cutiStartDate || "";
    }
    if (result.cutiHistory !== undefined && cutiHistoryInput) {
      cutiHistoryInput.value = result.cutiHistory || "";
    }
    
    // 🔥 Visual style - MERGED: Bedakan Non-Aktif (merah) vs status string lain (amber)
    if (typeof semesterValue === 'string') {
      const semesterLower = semesterValue.toLowerCase();
      if (semesterLower === 'non-aktif' || semesterLower === 'nonaktif') {
        // 🔴 Non-Aktif: merah
        semesterInput.className = 'w-full px-3 py-2 bg-red-50 text-red-700 font-semibold border border-red-200 rounded-lg';
      } else {
        // 🟡 Martikulasi / Lulus: amber
        semesterInput.className = 'w-full px-3 py-2 bg-amber-50 text-amber-700 font-semibold border border-amber-200 rounded-lg';
      }
    } else {
      // ⚪ Angka semester: putih biasa
      semesterInput.className = 'w-full px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg';
    }
    
    // 🔥 Tampilkan info status - MERGED: support cuti DAN nonaktif
    const info = document.getElementById('semesterInfo');
    if (info) {
      if (currentStatus?.toLowerCase() === 'nonaktif') {
        info.textContent = `Status: Non-Aktif (Semester dibekukan)`;
        info.className = 'text-sm text-red-600 mt-1';
      } else if (currentStatus?.toLowerCase() === 'cuti') {
        info.textContent = `Cuti (Semester ${savedSemester} dibekukan)`;
        info.className = 'text-sm text-orange-600 mt-1';
      } else if (currentStatus?.toLowerCase() === 'aktif' && typeof semesterValue === 'number') {
        info.textContent = `Semester ${semesterValue} (Hijriyah)`;
        info.className = 'text-sm text-blue-600 mt-1';
      } else {
        // Clear info untuk status lain
        info.textContent = '';
        info.className = '';
      }
    }
    
  } catch (e) {
    console.warn('Gagal hitung semester:', e);
    semesterInput.value = '1';
    if (semesterHidden) semesterHidden.value = '1';
  } finally {
    semesterInput.placeholder = '';
    semesterInput.disabled = false;
  }
}



