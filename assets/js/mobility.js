/**
 * mobility.js - International mobility management
 */

const MOBILITY_API = window.API.mobility;
let mobilityPrograms = [];
let currentMobilityPage = 1;
const mobilityItemsPerPage = 25;
let filteredMobilityData = null;

/* ===============================
   INIT
================================= */
async function initMobility() {
  loadMobilityCountryDropdown();
  await loadMobilityFromAPI();
  loadProdiPjDropdown();

  document
    .getElementById("mobilityForm")
    ?.addEventListener("submit", handleMobilitySubmit);

  // 🆕 Auto-fill kampus saat type program berubah
  document
    .getElementById("type_program")
    ?.addEventListener("change", updateKampusByType);
    
  initMobilityCalendar();
  renderMobilityTable(1);
  updateMobilityStats();
  // 🔥 Inisialisasi indikator filter
  updateFilterIndicator();
}
/* ===============================
   LOAD DATA
================================= */
async function loadMobilityFromAPI() {
  try {
    const res = await fetch(
      `${MOBILITY_API}&action=getAll&sheet=DATA MAHASISWA NON DEGREE`,
    );

    const result = await res.json();

    if (result.success) {
      console.log("RAW DATA:", result.data[0]);

      mobilityPrograms = result.data.map((row) => {
  const rawStart = row["Tahun Masuk Mahasiswa"] || row.tahun_masuk || "";
  const rawEnd = row["Tahun Keluar Mahasiswa"] || row.tahun_keluar || "";

  return {
    row: row.row,
    no: row["No"] || "",
    type: (row["Type Program"] || "").toString().trim().toLowerCase(),
    jenis: (row["Jenis Program"] || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_"),
    kampus: row["Kampus Asal"] || "",
    nama: row["Nama"] || "",
    ttl: row["Tempat dan Tanggal Lahir"] || "",
    negara: row["Negara"] || "",
    fakultas: row["Fakultas / Prodi / Penyelenggara Program"] || "",
    prodiPJ: row["Prodi/PJ"] || "",

    startISO: rawStart,
    endISO: rawEnd,

    tahunMasuk: formatTanggalIndo(rawStart),
    tahunKeluar: formatTanggalIndo(rawEnd),

    masaStudy: row["Masa Study"] || "",
    passport: row["No. Passport"] || "",
    gender: row["Jenis Kelamin"] || "",
    
    foto: row["Foto"] || row["Link Foto"] || "",
    file_loa: row["File Loa"] || row["File LOA"] || row["Link LOA"] || "",
    scan_passport: row["Scan Passport"] || "",
    regulerKmi: row["Reguler/Kmi"] || row["Reguler / KMI"] || row["Reguler_KMI"] || "",
    
    // 🆕 Field baru
    kampusTujuan: row["Kampus Tujuan"] || "",
    laporanKegiatan: row["Laporan Kegiatan"] || "",
  };
});

      // 🔥 TAMBAHKAN INI: Urutkan data terbaru (row terbesar) di paling atas
      mobilityPrograms.sort((a, b) => parseInt(b.row) - parseInt(a.row));

      console.log("MAPPED:", mobilityPrograms[0]);

      updateMobilityStats(); // 🔥 penting
    }
  } catch (err) {
    console.error("Load mobility error:", err);
  }
}
/* ===============================
  LOAD COUNTRY DROPDOWN - MOBILITY
================================= */
function loadMobilityCountryDropdown(force = false) {
  const select = document.getElementById("negara");
  if (!select) return;

  // kalau sudah ada isi dan tidak dipaksa → stop
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
  LOAD PRODI / PJ DROPDOWN (STATIC)
================================= */
function loadProdiPjDropdown(force = false) {
  const select = document.getElementById("prodi_pj");
  if (!select) return;

  // kalau sudah terisi dan tidak dipaksa → skip
  if (!force && select.options.length > 1) return;

  const PRODI_LIST = [
    // ===== PROGRAM STUDI S1 =====
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

    // ===== PROGRAM PASCASARJANA =====
    "Magister Pendidikan Bahasa Arab",
    "Magister Aqidah dan Filsafat Islam",
    "Magister Hukum Ekonomi Syariah",
    "Magister Ilmu Al-Qur'an dan Tafsir",
    "Magister Pendidikan Agama Islam",
    "Doktor Aqidah dan Filsafat Islam",

    // ===== FAKULTAS =====
    "Fakultas Humaniora",
    "Fakultas Ekonomi Manajemen",
    "Fakultas Tarbiyah",
    "Fakultas Ushuluddin",
    "Fakultas Syariah",
    "Fakultas Sains dan Teknologi",
    "Fakultas Kedokteran",
    "Fakultas Ilmu Kesehatan",

    // ===== UNIT / DIREKTORAT =====
    "Program Pascasarjana",
    "Universitas",
    "Centre For Islamic And Occidental Studies (CIOS) UNIDA Gontor",
    "Direktorat Pengembangan Bahasa (DPB)",
    "Direktorat Islamisasi",
    "Pusat Pendidikan Dan Pelatihan (PUSDIKLAT) UNIDA Gontor",
    "Satuan Kerja",
  ];

  // reset isi
  select.innerHTML = `<option value="">Pilih Program Studi</option>`;

  PRODI_LIST.forEach((prodi) => {
    const option = document.createElement("option");
    option.value = prodi;
    option.textContent = prodi;
    select.appendChild(option);
  });
}
// FullCalendar initialization
function initMobilityCalendar() {
  const calendarEl = document.getElementById("mobilityCalendar");
  if (!calendarEl) return;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "id",
    height: "auto",
    contentHeight: 520,
    aspectRatio: 1.8,

    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,listMonth",
    },

    buttonText: {
      today: "Hari Ini",
      month: "Bulan",
      list: "List",
    },

    dayMaxEventRows: 3,
    moreLinkText: "lainnya",

    eventDisplay: "block",

    events: mobilityPrograms
      .filter((p) => p.startISO)
      .map((p) => ({
        title: p.nama,
        start: p.startISO,
        end: p.endISO,
        backgroundColor:
          p.type === "outbound"
            ? "#3B82F6"
            : p.type === "inbound"
              ? "#10B981"
              : "#8B5CF6",
        borderColor: "transparent",
        textColor: "#ffffff",
        extendedProps: { program: p },
      })),

    eventClick: function (info) {
      const prog = info.event.extendedProps.program;

      showEventModal(prog);
    },

    eventDidMount: function (info) {
      info.el.classList.add("rounded-md", "text-xs", "font-medium", "px-1");
    },
  });

  calendar.render();

  renderUpcomingEvents(); // 🔥 sinkron kanan
}
// render show calender
function showEventModal(prog) {
  const typeColor =
    prog.type === "outbound"
      ? "bg-blue-100 text-blue-700"
      : prog.type === "inbound"
        ? "bg-green-100 text-green-700"
        : "bg-purple-100 text-purple-700";

  const html = `
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 class="text-lg font-semibold mb-3">${prog.nama}</h3>

        <div class="space-y-2 text-sm text-gray-600">
          <p><strong>Negara:</strong> ${prog.negara}</p>
          <p><strong>Periode:</strong> ${prog.tahunMasuk} - ${prog.tahunKeluar}</p>
          <p><strong>Kampus:</strong> ${prog.kampus}</p>
          <span class="inline-block px-2 py-1 text-xs rounded ${typeColor}">
            ${prog.type}
          </span>
        </div>

        <button onclick="this.closest('.fixed').remove()"
          class="mt-5 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Tutup
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);
}
/* ===============================
   VIEW MOBILITY DETAIL
================================= */
function viewMobilityDetail(row) {
  const prog = mobilityPrograms.find((p) => p.row == row);
  if (!prog) {
    alert('Data tidak ditemukan');
    return;
  }

  // Cek apakah modal sudah ada, jika belum buat secara dinamis
  let modal = document.getElementById('mobilityDetailModal');
  if (!modal) {
    createMobilityDetailModal();
    modal = document.getElementById('mobilityDetailModal');
  }

  // Warna badge untuk type
  const typeColor = prog.type === 'outbound' 
    ? 'bg-blue-100 text-blue-800 border-blue-200' 
    : prog.type === 'inbound' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-purple-100 text-purple-800 border-purple-200';

  // Warna untuk jenis
  const jenisColor = prog.jenis === 'exchange' ? 'bg-indigo-100 text-indigo-800' :
                     prog.jenis === 'internship' ? 'bg-pink-100 text-pink-800' :
                     prog.jenis === 'research' ? 'bg-yellow-100 text-yellow-800' :
                     prog.jenis === 'short_course' ? 'bg-orange-100 text-orange-800' :
                     prog.jenis === 'double_degree' ? 'bg-red-100 text-red-800' :
                     'bg-gray-100 text-gray-800';

  // Format jenis untuk ditampilkan
  const jenisLabel = {
    'exchange': 'Student Exchange',
    'short_course': 'Short Course',
    'internship': 'Internship',
    'research': 'Research',
    'double_degree': 'Double Degree',
    'other': 'Lainnya'
  }[prog.jenis] || prog.jenis || '-';

  // Isi konten modal
  document.getElementById('mobilityDetailContent').innerHTML = `
    <!-- Header dengan Foto & Info Utama -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
      <div class="flex flex-col md:flex-row items-center gap-6">
        <!-- Foto -->
        <div class="w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex-shrink-0">
          ${prog.foto ? `
            <img src="${getGoogleDriveImageUrlMobility(prog.foto)}" 
                 alt="${prog.nama}" 
                 class="w-full h-full object-cover"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22150%22 viewBox=%220 0 24 24%22 fill=%22%23e5e7eb%22%3E%3Crect width=%2224%22 height=%2224%22 rx=%2212%22/%3E%3Cpath fill=%22%239ca3af%22 d=%22M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%22/%3E%3C/svg%3E'">
          ` : `
            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500">
              <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
          `}
        </div>
        
        <!-- Info Utama -->
        <div class="flex-1 text-center md:text-left">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">${prog.nama}</h2>
          <div class="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
            <span class="px-3 py-1 text-xs font-semibold rounded-full border ${typeColor}">
              ${prog.type ? prog.type.toUpperCase() : '-'}
            </span>
            <span class="px-3 py-1 text-xs font-semibold rounded-full ${jenisColor}">
              ${jenisLabel}
            </span>
            ${prog.gender ? `
              <span class="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                ${prog.gender === 'Male' ? '♂ Laki-laki' : '♀ Perempuan'}
              </span>
            ` : ''}
          </div>
          <p class="text-sm text-gray-600">
            <span class="font-semibold">🌍 ${prog.negara || '-'}</span>
            ${prog.ttl ? ` • <span class="text-gray-500">📍 ${prog.ttl}</span>` : ''}
          </p>
        </div>
      </div>
    </div>

    <!-- Grid Informasi -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Informasi Program -->
      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <h3 class="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
          <span class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">📋</span>
          Informasi Program
        </h3>
        <div class="space-y-3">
          <div class="flex justify-between items-start py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Kampus Asal</span>
            <span class="text-sm font-semibold text-gray-800 text-right max-w-[60%]">${prog.kampus || '-'}</span>
          </div>
          <!-- 🆕 Kampus Tujuan -->
          <div class="flex justify-between items-start py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Kampus Tujuan</span>
            <span class="text-sm font-semibold text-gray-800 text-right max-w-[60%]">${prog.kampusTujuan || '-'}</span>
          </div>
          <div class="flex justify-between items-start py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Fakultas/Prodi</span>
            <span class="text-sm font-semibold text-gray-800 text-right max-w-[60%]">${prog.fakultas || '-'}</span>
          </div>
          <div class="flex justify-between items-start py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Prodi/PJ</span>
            <span class="text-sm font-semibold text-gray-800 text-right max-w-[60%]">${prog.prodiPJ || '-'}</span>
          </div>
          <div class="flex justify-between items-start py-2">
            <span class="text-sm text-gray-500">Reguler/KMI</span>
            <span class="text-sm font-semibold text-gray-800">${prog.regulerKmi || '-'}</span>
          </div>
        </div>
      </div>

      <!-- Informasi Periode -->
      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <h3 class="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
          <span class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">📅</span>
          Periode & Durasi
        </h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Tanggal Mulai</span>
            <span class="text-sm font-semibold text-gray-800">${prog.tahunMasuk || '-'}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Tanggal Selesai</span>
            <span class="text-sm font-semibold text-gray-800">${prog.tahunKeluar || '-'}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-sm text-gray-500">Masa Studi</span>
            <span class="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">${prog.masaStudy || '-'}</span>
          </div>
          <div class="flex justify-between items-center py-2">
            <span class="text-sm text-gray-500">Status</span>
            <span class="px-3 py-1 text-xs font-semibold rounded-full ${typeColor}">
              ${prog.type ? prog.type.toUpperCase() : '-'}
            </span>
          </div>
        </div>
      </div>

      <!-- Informasi Dokumen -->
      <div class="bg-white border border-gray-200 rounded-xl p-5 md:col-span-2">
        <h3 class="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
          <span class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">📄</span>
          Dokumen & Identitas
        </h3>
        <div class="grid md:grid-cols-3 gap-4">
          <div class="bg-gray-50 p-3 rounded-lg">
            <p class="text-xs text-gray-500 mb-1">No. Passport</p>
            <p class="font-semibold text-gray-800">${prog.passport || '-'}</p>
          </div>
          ${prog.file_loa ? `
            <a href="${prog.file_loa}" target="_blank" 
               class="bg-blue-50 hover:bg-blue-100 p-3 rounded-lg transition flex items-center gap-3 group">
              <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-blue-900 truncate">LOA</p>
                <p class="text-xs text-blue-600">Lihat File</p>
              </div>
            </a>
          ` : `
            <div class="bg-gray-50 p-3 rounded-lg">
              <p class="text-xs text-gray-500 mb-1">File LOA</p>
              <p class="font-semibold text-gray-400">-</p>
            </div>
          `}
          ${prog.scan_passport ? `
            <a href="${prog.scan_passport}" target="_blank" 
               class="bg-green-50 hover:bg-green-100 p-3 rounded-lg transition flex items-center gap-3 group">
              <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-9 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-4 0h4"></path>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-green-900 truncate">Scan Passport</p>
                <p class="text-xs text-green-600">Lihat File</p>
              </div>
            </a>
          ` : `
            <div class="bg-gray-50 p-3 rounded-lg">
              <p class="text-xs text-gray-500 mb-1">Scan Passport</p>
              <p class="font-semibold text-gray-400">-</p>
            </div>
          `}
          <!-- 🆕 Laporan Kegiatan -->
          ${prog.laporanKegiatan ? `
            <a href="${prog.laporanKegiatan}" target="_blank" 
               class="bg-amber-50 hover:bg-amber-100 p-3 rounded-lg transition flex items-center gap-3 group">
              <div class="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-amber-900 truncate">Laporan Kegiatan</p>
                <p class="text-xs text-amber-600">Lihat File</p>
              </div>
            </a>
          ` : `
            <div class="bg-gray-50 p-3 rounded-lg">
              <p class="text-xs text-gray-500 mb-1">Laporan Kegiatan</p>
              <p class="font-semibold text-gray-400">-</p>
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  // Tampilkan modal
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

/* ===============================
   CREATE MOBILITY DETAIL MODAL
================================= */
function createMobilityDetailModal() {
  const modalHTML = `
    <div id="mobilityDetailModal" 
         class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center justify-center z-[60] p-4"
         onclick="closeMobilityDetailModal(event)">
      <div class="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
           onclick="event.stopPropagation()">
        <!-- Header -->
        <div class="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl sticky top-0 z-10">
          <h3 class="font-semibold text-lg text-white flex items-center gap-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            Detail Program Mobilitas
          </h3>
          <button onclick="closeMobilityDetailModal()" 
                  class="text-white hover:text-gray-200 text-3xl transition">
            &times;
          </button>
        </div>
        
        <!-- Content -->
        <div id="mobilityDetailContent" class="p-6">
          <!-- Dynamic content -->
        </div>
        
        <!-- Footer -->
        <div class="px-6 py-4 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button onclick="closeMobilityDetailModal()" 
                  class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
            Tutup
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/* ===============================
   CLOSE MOBILITY DETAIL MODAL
================================= */
function closeMobilityDetailModal(event) {
  const modal = document.getElementById('mobilityDetailModal');
  if (!modal) return;
  
  // Close jika klik backdrop atau tidak ada event
  if (!event || event.target.id === 'mobilityDetailModal') {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }
}

// Close dengan ESC key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const modal = document.getElementById('mobilityDetailModal');
    if (modal && !modal.classList.contains('hidden')) {
      closeMobilityDetailModal();
    }
  }
});

/* ===============================
   HELPER: Google Drive Image URL (Mobility)
================================= */
function getGoogleDriveImageUrlMobility(driveUrl) {
  if (!driveUrl || driveUrl.trim() === '') return null;
  
  driveUrl = driveUrl.trim();
  let fileId = null;
  
  const match1 = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) fileId = match1[1];
  
  if (!fileId) {
    const match2 = driveUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match2) fileId = match2[1];
  }
  
  if (!fileId) {
    const match3 = driveUrl.match(/thumbnail\?id=([a-zA-Z0-9_-]+)/);
    if (match3) fileId = match3[1];
  }
  
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
  }
  
  if (driveUrl.match(/^https?:\/\//)) {
    return driveUrl;
  }
  
  return null;
}
// Render mobility table
function renderMobilityTable(page = 1, data = null) {
  const tbody = document.getElementById("mobilityTableBody");
  if (!tbody) return;

  currentMobilityPage = page;
  
  // 🔥 Gunakan data yang sudah difilter jika ada, atau semua data
  const dataToShow = data || filteredMobilityData || mobilityPrograms;

  const start = (page - 1) * mobilityItemsPerPage;
  const end = start + mobilityItemsPerPage;
  const paginatedData = dataToShow.slice(start, end);

  if (!paginatedData.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-6 text-gray-400">
          <div class="flex flex-col items-center gap-2">
            <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>Tidak ada data ditemukan</p>
            <button onclick="resetMobilityFilters()" class="text-xs text-blue-600 hover:underline">
              Reset Filter
            </button>
          </div>
        </td>
      </tr>
    `;
    renderMobilityPagination(dataToShow.length);
    return;
  }

  tbody.innerHTML = paginatedData
    .map(
      (p) => `
    <tr class="hover:bg-blue-50/30 transition">
      <td class="px-4 py-3 font-medium">${p.nama}</td>
      <td class="px-4 py-3 capitalize">${formatJenisLabel(p.jenis) || "-"}</td>
      <td class="px-4 py-3">${p.kampus}</td>
      <td class="px-4 py-3 text-xs">${p.tahunMasuk} - ${p.tahunKeluar}</td>
      <td class="px-4 py-3">${p.masaStudy || "-"}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-1 text-xs font-medium rounded-full ${
          p.type === 'outbound' ? 'bg-blue-100 text-blue-800' :
          p.type === 'inbound' ? 'bg-green-100 text-green-800' :
          'bg-purple-100 text-purple-800'
        }">
          ${p.type || "-"}
        </span>
      </td>
      <td class="px-4 py-3">
        <div class="flex gap-1">
          <button 
            onclick="viewMobilityDetail(${p.row})"
            class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            title="Lihat Detail"
          >
            👁
          </button>
          <button 
            onclick="editMobility(${p.row})"
            class="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
            title="Edit"
          >
            ✏️
          </button>
          <button 
            onclick="deleteMobility(${p.row})"
            class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"
            title="Hapus"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("");

  renderMobilityPagination(dataToShow.length);
}

// 🔥 Helper untuk format label jenis program
function formatJenisLabel(jenis) {
  const labels = {
    'exchange': 'Student Exchange',
    'short_course': 'Short Course',
    'internship': 'Internship',
    'research': 'Research',
    'double_degree': 'Double Degree',
    'other': 'Lainnya'
  };
  return labels[jenis] || jenis;
}
// === FILTER TABLE === //
function filterMobilityTable() {
  const keyword = document.getElementById("mobilitySearch").value.toLowerCase();

  if (!keyword) {
    filteredMobilityData = null;
    renderMobilityTable(1, mobilityPrograms);
    return;
  }

  filteredMobilityData = mobilityPrograms.filter((p) =>
    (p.nama + p.jenis + p.type + p.kampus + p.negara)
      .toLowerCase()
      .includes(keyword),
  );

  renderMobilityTable(1, filteredMobilityData);
}
/* ===============================
   FILTER PER KOLOM - MOBILITY
================================= */

// 🔥 Fungsi utama untuk menerapkan semua filter
function applyMobilityFilters() {
  // Ambil nilai semua filter
  const nama = document.getElementById("filter-nama")?.value.toLowerCase().trim() || "";
  const jenis = document.getElementById("filter-jenis")?.value || "";
  const mitra = document.getElementById("filter-mitra")?.value.toLowerCase().trim() || "";
  const periodeFrom = document.getElementById("filter-periode-from")?.value || "";
  const periodeTo = document.getElementById("filter-periode-to")?.value || "";
  const masa = document.getElementById("filter-masa")?.value.toLowerCase().trim() || "";
  const status = document.getElementById("filter-status")?.value || "";
  
  // Filter data
  filteredMobilityData = mobilityPrograms.filter((p) => {
    // Filter Nama
    if (nama && !p.nama.toLowerCase().includes(nama)) return false;
    
    // Filter Jenis
    if (jenis && p.jenis !== jenis) return false;
    
    // Filter Mitra/Kampus
    if (mitra && !p.kampus.toLowerCase().includes(mitra)) return false;
    
    // Filter Periode (date range)
    if (periodeFrom || periodeTo) {
      const startDate = p.startISO; // format YYYY-MM-DD
      if (periodeFrom && startDate < periodeFrom) return false;
      if (periodeTo && startDate > periodeTo) return false;
    }
    
    // Filter Masa Studi
    if (masa && !p.masaStudy.toLowerCase().includes(masa)) return false;
    
    // Filter Status/Type
    if (status && p.type !== status) return false;
    
    return true;
  });
  
  // Update indikator filter aktif
  updateFilterIndicator();
  
  // Render tabel dengan data yang sudah difilter
  renderMobilityTable(1, filteredMobilityData);
}

// 🔥 Fungsi untuk reset semua filter
function resetMobilityFilters() {
  // Reset semua input filter
  const filters = [
    "filter-nama", 
    "filter-jenis", 
    "filter-mitra", 
    "filter-periode-from", 
    "filter-periode-to", 
    "filter-masa", 
    "filter-status"
  ];
  
  filters.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  
  // Reset filtered data
  filteredMobilityData = null;
  
  // Hide indikator
  updateFilterIndicator();
  
  // Render ulang tabel dengan semua data
  renderMobilityTable(1, mobilityPrograms);
}

// 🔥 Update indikator filter aktif (titik biru berkedip)
function updateFilterIndicator() {
  const indicator = document.getElementById("filterIndicator");
  if (!indicator) return;
  
  const hasFilter = 
    (document.getElementById("filter-nama")?.value || "") !== "" ||
    (document.getElementById("filter-jenis")?.value || "") !== "" ||
    (document.getElementById("filter-mitra")?.value || "") !== "" ||
    (document.getElementById("filter-periode-from")?.value || "") !== "" ||
    (document.getElementById("filter-periode-to")?.value || "") !== "" ||
    (document.getElementById("filter-masa")?.value || "") !== "" ||
    (document.getElementById("filter-status")?.value || "") !== "";
  
  if (hasFilter) {
    indicator.classList.remove("hidden");
  } else {
    indicator.classList.add("hidden");
  }
}
// Upcoming events sidebar
function renderUpcomingEvents() {
  const container = document.getElementById("upcomingEvents");
  if (!container) return;

  const today = new Date();

  const upcoming = mobilityPrograms
    .filter((p) => p.endISO && new Date(p.endISO) >= today)
    .sort((a, b) => new Date(a.startISO) - new Date(b.startISO));
    

  function getBadgeColor(type) {
    if (type === "outbound") return "bg-blue-100 text-blue-600";
    if (type === "inbound") return "bg-green-100 text-green-600";
    return "bg-purple-100 text-purple-600";
  }

  function getCountdown(startDate) {
    const diff = new Date(startDate) - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `Mulai dalam ${days} hari`;
    if (days === 0) return `Mulai hari ini`;
    return `Sedang berlangsung`;
  }

  container.innerHTML = upcoming.length
    ? upcoming
        .map(
          (p) => `
      <div class="p-4 border rounded-xl hover:shadow-md transition cursor-pointer bg-white"
           onclick='showEventModal(${JSON.stringify(p)})'>

        <div class="flex justify-between items-start">
          <p class="font-semibold text-sm text-gray-800">${p.nama}</p>
          <span class="text-[10px] px-2 py-1 rounded-full ${getBadgeColor(p.type)}">
            ${p.type}
          </span>
        </div>

        <p class="text-xs text-gray-500 mt-1">
          ${p.negara || "-"}
        </p>

        <p class="text-xs text-gray-400 mt-1">
          ${p.tahunMasuk} - ${p.tahunKeluar}
        </p>

        <p class="text-xs mt-2 font-medium text-blue-600">
          ${getCountdown(p.startISO)}
        </p>
      </div>
    `,
        )
        .join("")
    : `<div class="text-center py-6 text-sm text-gray-400">
        🎉 Tidak ada program mendatang
      </div>`;
}
/* ===============================
   PAGINATION MOBILITY
================================= */
function renderMobilityPagination(total) {
  const pagination = document.getElementById("mobilityPagination");
  if (!pagination) return;

  const pageCount = Math.ceil(total / mobilityItemsPerPage);
  pagination.innerHTML = "";

  if (pageCount <= 1) return;

  const maxVisible = 5;
  let start = Math.max(1, currentMobilityPage - Math.floor(maxVisible / 2));
  let end = Math.min(pageCount, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  // ⬅ Prev
  pagination.innerHTML += `
    <button onclick="goToMobilityPage(${Math.max(1, currentMobilityPage - 1)})"
      class="px-3 py-1 border rounded-lg hover:bg-gray-100">
      ◀
    </button>
  `;

  // Page 1
  if (start > 1) {
    pagination.innerHTML += mobilityPageButton(1);
    if (start > 2) pagination.innerHTML += mobilityEllipsis();
  }

  // Middle pages
  for (let i = start; i <= end; i++) {
    pagination.innerHTML += mobilityPageButton(i);
  }

  // Last page
  if (end < pageCount) {
    if (end < pageCount - 1) pagination.innerHTML += mobilityEllipsis();
    pagination.innerHTML += mobilityPageButton(pageCount);
  }

  // Next ➡
  pagination.innerHTML += `
    <button onclick="goToMobilityPage(${Math.min(
      pageCount,
      currentMobilityPage + 1,
    )})"
      class="px-3 py-1 border rounded-lg hover:bg-gray-100">
      ▶
    </button>
  `;
}

function mobilityPageButton(page) {
  return `
    <button onclick="goToMobilityPage(${page})"
      class="px-3 py-1 rounded-lg border ${
        page === currentMobilityPage
          ? "bg-blue-600 text-white"
          : "hover:bg-gray-100"
      }">
      ${page}
    </button>
  `;
}

function mobilityEllipsis() {
  return `<span class="px-2 text-gray-400">...</span>`;
}

function goToMobilityPage(page) {
  currentMobilityPage = page;
  renderMobilityTable(page);
}
// Update stats cards
function updateMobilityStats() {
  const outboundEl = document.getElementById("outboundCount");
  const inboundEl = document.getElementById("inboundCount");
  const partnerEl = document.getElementById("partnerCount");

  // 🔥 kalau bukan halaman mobility → STOP
  if (!outboundEl || !inboundEl || !partnerEl) return;

  const outbound = mobilityPrograms.filter((p) =>
    p.type?.toLowerCase().includes("outbound"),
  ).length;

  const inbound = mobilityPrograms.filter((p) =>
    p.type?.toLowerCase().includes("inbound"),
  ).length;

  const partners = new Set(
    mobilityPrograms.map((p) => p.kampus?.trim()).filter(Boolean),
  ).size;

  outboundEl.textContent = outbound;
  inboundEl.textContent = inbound;
  partnerEl.textContent = partners;
}
// Modal functions
function openMobilityModal(isEdit = false, program = null) {
  const modal = document.getElementById("mobilityFormSection");
  const title = document.getElementById("modalTitle");
  
  if (!modal) {
    console.error("Modal tidak ditemukan!");
    return;
  }

  // ganti judul
  if (title) {
    title.textContent = isEdit ? "Edit Program Mobilitas" : "Form Program Mobilitas";
  }

  // 🆕 Reset visual indicator
  const kampusAsal = document.getElementById("kampus_asal");
  const kampusTujuan = document.getElementById("kampus_tujuan");
  if (kampusAsal) kampusAsal.classList.remove("bg-blue-50", "border-blue-300");
  if (kampusTujuan) kampusTujuan.classList.remove("bg-blue-50", "border-blue-300");

  if (isEdit && program) {
    // Set value dengan validasi
    safeSetValue("mobilityId", program.row);
    
    // 🆕 Set type_program - pastikan value valid
    const typeValue = program.type || "";
    safeSetValue("type_program", typeValue);
    
    safeSetValue("jenis_program", program.jenis || "");
    
    // 🆕 Set kampus - gunakan data asli, JANGAN auto-fill
    safeSetValue("kampus_asal", program.kampus || "");
    safeSetValue("kampus_tujuan", program.kampusTujuan || "");
    
    safeSetValue("nama", program.nama || "");

    // Parse TTL
    const ttlValue = program.ttl || "";
    parseTTLToForm(ttlValue);
    safeSetValue("ttl", ttlValue);

    setSelectValue("negara", program.negara);
    setSelectValue("fakultas_prodi_program", program.fakultas);
    setSelectValue("prodi_pj", program.prodiPJ);

    safeSetValue("tahun_masuk", convertToInputDate(program.startISO));
    safeSetValue("tahun_keluar", convertToInputDate(program.endISO));
    safeSetValue("masa_study", program.masaStudy || "");
    safeSetValue("no_passport", program.passport || "");
    safeSetValue("jenis_kelamin", program.gender || "Male");
    
    // Field tambahan untuk file
    safeSetValue("file_loa", program.file_loa || "");
    safeSetValue("scan_passport", program.scan_passport || "");
    safeSetValue("foto", program.foto || "");
    safeSetValue("reguler_kmi", program.regulerKmi || "");
    safeSetValue("laporan_kegiatan", program.laporanKegiatan || "");
    
  } else {
    // Reset form untuk tambah baru
    const form = document.getElementById("mobilityForm");
    if (form) form.reset();
    safeSetValue("mobilityId", "");
    
    // 🆕 Trigger auto-fill untuk form baru (akan cek type_program)
    setTimeout(() => updateKampusByType(), 50);
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  
  // Scroll ke atas modal
  const modalContent = modal.querySelector('.overflow-y-auto');
  if (modalContent) {
    modalContent.scrollTop = 0;
  }
  
  document.body.classList.add("overflow-hidden");
}

// Helper function untuk set value dengan aman
function safeSetValue(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.value = value || "";
  } else {
    console.warn(`Element dengan id "${id}" tidak ditemukan`);
  }
}
/* ===============================
   PARSE TTL UNIVERSAL
================================= */
function parseTTLToForm(ttlValue) {
  const tempatInput = document.getElementById("tempat_lahir");
  const tanggalInput = document.getElementById("tanggal_lahir");

  if (!tempatInput || !tanggalInput) return;

  if (!ttlValue) {
    tempatInput.value = "";
    tanggalInput.value = "";
    return;
  }

  // pisahkan dengan berbagai separator
  const separators = [",", "/", ".", "-"];
  let tempat = ttlValue;
  let tanggal = "";

  for (let sep of separators) {
    if (ttlValue.includes(sep)) {
      const parts = ttlValue.split(sep);
      tempat = parts[0].trim();
      tanggal = parts.slice(1).join(sep).trim();
      break;
    }
  }

  tempatInput.value = tempat;
  tanggalInput.value = smartConvertDate(tanggal);
}
/* ===============================
   SMART DATE CONVERTER
================================= */
function smartConvertDate(dateStr) {
  if (!dateStr) return "";

  // kalau sudah ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.split("T")[0];
  }

  // format 22/05/1999
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split("/");
    return `${y}-${m}-${d}`;
  }

  // format 10 Sep 2002 / 04 September 2002
  const bulanMap = {
    januari: "01",
    februari: "02",
    maret: "03",
    april: "04",
    mei: "05",
    juni: "06",
    juli: "07",
    agustus: "08",
    september: "09",
    oktober: "10",
    november: "11",
    desember: "12",
    jan: "01",
    feb: "02",
    mar: "03",
    apr: "04",
    jun: "06",
    jul: "07",
    agu: "08",
    sep: "09",
    okt: "10",
    nov: "11",
    des: "12",
  };

  const parts = dateStr.toLowerCase().split(" ");
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const month = bulanMap[parts[1]] || "01";
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }

  return "";
}
function closeMobilityModal() {
  const modal = document.getElementById("mobilityFormSection");

  if (!modal) return;

  modal.classList.remove("flex");
  modal.classList.add("hidden");

  document.body.classList.remove("overflow-hidden");
}

function addNewMobility() {
  openMobilityModal(false);
}

function editMobility(row) {
  const prog = mobilityPrograms.find((p) => p.row == row);
  if (prog) openMobilityModal(true, prog);
}

async function deleteMobility(row) {
  if (!confirm("Hapus program ini?")) return;

  try {
    const res = await fetch(MOBILITY_API, {
      method: "POST",
      body: JSON.stringify({
        action: "delete",
        sheet: "DATA MAHASISWA NON DEGREE",
        row: row,
      }),
    });

    const result = await res.json();

    if (result.success) {
      // reload data dari backend
      await loadMobilityFromAPI();

      document.getElementById("mobilityCalendar").innerHTML = "";
      initMobilityCalendar();

      renderMobilityTable(1);
      updateMobilityStats();

      alert("✅ Data berhasil dihapus!");
    } else {
      alert("❌ Gagal hapus: " + result.error);
    }
  } catch (err) {
    console.error("Delete error:", err);
    alert("❌ Error saat menghapus data");
  }
}
function showMobilityForm() {
  const modal = document.getElementById("mobilityFormSection");

  if (!modal) return;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  // reset form saat buka
  const form = document.getElementById("mobilityForm");
  if (form) form.reset();

  const idField = document.getElementById("mobilityId");
  if (idField) idField.value = "";

  // 🆕 Trigger auto-fill setelah form di-reset
  setTimeout(() => updateKampusByType(), 50);

  // optional: disable scroll body
  document.body.classList.add("overflow-hidden");
}
// Form handler
// Form handler
async function handleMobilitySubmit(e) {
  e.preventDefault();

  const form = document.getElementById("mobilityForm");
  const submitBtn = form.querySelector("button[type='submit']");
  const rowId = document.getElementById("mobilityId").value;

  if (submitBtn.disabled) return;

  submitBtn.disabled = true;
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = "⏳ Menyimpan...";

  try {
    // GABUNG TTL
    const tempat = document.getElementById("tempat_lahir").value;
    const tanggal = document.getElementById("tanggal_lahir").value;
    const ttlGabung = tempat && tanggal ? `${tempat}, ${tanggal}` : tempat || "";
    document.getElementById("ttl").value = ttlGabung;

    // Hitung Masuk Tahun & Keluar Tahun
    let masukTahun = "";
    let keluarTahun = "";
    const tMasuk = document.getElementById("tahun_masuk").value;
    const tKeluar = document.getElementById("tahun_keluar").value;
    if (tMasuk) {
      const d = new Date(tMasuk);
      if (!isNaN(d)) masukTahun = d.getFullYear();
    }
    if (tKeluar) {
      const d = new Date(tKeluar);
      if (!isNaN(d)) keluarTahun = d.getFullYear();
    }

    // 🔥 AMBIL SEMUA NILAI FORM
    const formData = {
      type_program: document.getElementById("type_program").value,
      jenis_program: document.getElementById("jenis_program").value,
      kampus_asal: document.getElementById("kampus_asal").value,
      nama: document.getElementById("nama").value,
      ttl: ttlGabung,
      negara: document.getElementById("negara").value,
      fakultas_prodi_program: document.getElementById("fakultas_prodi_program").value,
      prodi_pj: document.getElementById("prodi_pj").value,
      tahun_masuk: tMasuk,
      tahun_keluar: tKeluar,
      masa_study: document.getElementById("masa_study").value,
      no_passport: document.getElementById("no_passport").value,
      jenis_kelamin: document.getElementById("jenis_kelamin").value,
      reguler_kmi: document.getElementById("reguler_kmi").value || "",
      file_loa: document.getElementById("file_loa").value || "",
      scan_passport: document.getElementById("scan_passport").value || "",
      foto: document.getElementById("foto").value || "",
      // 🆕 Field baru
      kampus_tujuan: document.getElementById("kampus_tujuan").value || "",
      laporan_kegiatan: document.getElementById("laporan_kegiatan").value || "",
    };

    // 🔥 PAYLOAD: Key lowercase (untuk create) + Key PERSIS header sheet (untuk update)
    const payload = {
      action: rowId ? "update" : "create",
      sheet: "DATA MAHASISWA NON DEGREE",
      row: rowId || "",

      // ✅ Key lowercase (untuk backend createStudent)
      ...formData,
      masuk_tahun: masukTahun,
      keluar_tahun: keluarTahun,
      report_izin: "",

      // ✅ Key PERSIS sama dengan header sheet (untuk backend updateStudent)
      // Perhatikan case dan spasi HARUS PERSIS!
      "No": "",
      "Type Program": formData.type_program,
      "Jenis Program": formData.jenis_program,
      "Kampus Asal": formData.kampus_asal,
      "Nama": formData.nama,
      "Tempat dan Tanggal Lahir": formData.ttl,
      "Negara": formData.negara,
      "Fakultas / Prodi / Penyelenggara Program": formData.fakultas_prodi_program,
      "Prodi/PJ": formData.prodi_pj,
      "Tahun Masuk Mahasiswa": formData.tahun_masuk,
      "Tahun Keluar Mahasiswa": formData.tahun_keluar,
      "Masa Study": formData.masa_study,
      "No. Passport": formData.no_passport,
      "Masuk Tahun": masukTahun,
      "Keluar Tahun": keluarTahun,
      "Report / Izin Belajar": "",
      "Scan Passport": formData.scan_passport,
      "Foto": formData.foto,
      "File Loa": formData.file_loa,         // ✅ "File Loa" (bukan "File LOA")
      "Reguler/Kmi": formData.reguler_kmi,   // ✅ "Reguler/Kmi" (tanpa spasi)
      "Jenis Kelamin": formData.jenis_kelamin,
       // 🆕 Field baru
      "Kampus Tujuan": formData.kampus_tujuan,
      "Laporan Kegiatan": formData.laporan_kegiatan,
    };

    console.log("📦 PAYLOAD LENGKAP:", payload);
    console.log("🎯 Action:", payload.action);
    console.log("🔑 File Loa:", payload["File Loa"]);
    console.log("🔑 Reguler/Kmi:", payload["Reguler/Kmi"]);

    const res = await fetch(MOBILITY_API, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log("📥 HASIL DARI SERVER:", result);

    if (!result.success) {
      throw new Error(result.error || "Gagal menyimpan");
    }

    await loadMobilityFromAPI();
    document.getElementById("mobilityCalendar").innerHTML = "";
    initMobilityCalendar();
    renderMobilityTable(1);
    updateMobilityStats();
    closeMobilityModal();

    alert(rowId ? "✅ Data berhasil diupdate!" : "✅ Data berhasil ditambahkan!");
  } catch (err) {
    console.error("❌ Error:", err);
    alert("❌ Terjadi kesalahan: " + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}
function formatMobilityStatus(code) {
  const map = {
    aktif: "Aktif",
    process: "Persiapan",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };
  return map[code] || code;
}
function formatTanggalIndo(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
function convertToInputDate(dateString) {
  if (!dateString) return "";

  // kalau sudah ISO
  if (dateString.includes("-")) return dateString.split("T")[0];

  // kalau format mm/dd/yyyy
  const parts = dateString.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
  }

  return "";
}
function setSelectValue(id, value) {
  const select = document.getElementById(id);
  if (!select) return;

  const options = Array.from(select.options);

  const match = options.find(
    (opt) =>
      opt.value.trim().toLowerCase() === (value || "").trim().toLowerCase(),
  );

  if (match) {
    select.value = match.value;
  } else {
    select.value = "";
  }
}
// ===============================
// AUTO HITUNG MASA STUDY
// ===============================
function calculateMasaStudy() {
  const start = document.getElementById("tahun_masuk").value;
  const end = document.getElementById("tahun_keluar").value;

  if (!start || !end) return;

  const startDate = new Date(start);
  const endDate = new Date(end);

  const diffTime = endDate - startDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);

  document.getElementById("masa_study").value =
    diffMonths > 0 ? diffMonths + " Bulan" : diffDays + " Hari";
}

// trigger otomatis
document.addEventListener("change", function (e) {
  if (e.target.id === "tahun_masuk" || e.target.id === "tahun_keluar") {
    calculateMasaStudy();
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("mobilityFormSection");

  if (!modal) return;

  modal.addEventListener("click", function (e) {
    if (e.target === this) {
      closeMobilityModal();
    }
  });
});
function getTotalActiveMobility() {
  if (!mobilityPrograms || mobilityPrograms.length === 0) return 0;

  const outbound = mobilityPrograms.filter((p) =>
    p.type?.toLowerCase().includes("outbound"),
  ).length;

  const inbound = mobilityPrograms.filter((p) =>
    p.type?.toLowerCase().includes("inbound"),
  ).length;

  return outbound + inbound;
}
/* ===============================
   AUTO-FILL KAMPUS BERDASARKAN TYPE PROGRAM
================================= */
function updateKampusByType() {
  const typeProgram = document.getElementById("type_program").value;
  const kampusAsal = document.getElementById("kampus_asal");
  const kampusTujuan = document.getElementById("kampus_tujuan");
  
  if (!kampusAsal || !kampusTujuan) return;
  
  const UNIDA = "Universitas Darussalam Gontor";
  
  // Reset visual indicator
  kampusAsal.classList.remove("bg-blue-50", "border-blue-300");
  kampusTujuan.classList.remove("bg-blue-50", "border-blue-300");
  
  // 🆕 Jika belum pilih type, kosongkan kedua field
  if (!typeProgram) {
    kampusAsal.value = "";
    kampusTujuan.value = "";
    return;
  }
  
  if (typeProgram === "outbound") {
    // Outbound: Dari UNIDA → Luar
    kampusAsal.value = UNIDA;
    kampusAsal.classList.add("bg-blue-50", "border-blue-300");
    kampusTujuan.value = "";
  } else if (typeProgram === "inbound") {
    // Inbound: Dari Luar → UNIDA
    kampusTujuan.value = UNIDA;
    kampusTujuan.classList.add("bg-blue-50", "border-blue-300");
    kampusAsal.value = "";
  } else if (typeProgram === "virtual") {
    // Virtual: kedua field bisa diisi manual
    kampusAsal.value = "";
    kampusTujuan.value = "";
  }
}

// === DOWNLOAD FILE === //
function getMobilityExportData() {
  return filteredMobilityData || mobilityPrograms;
}
function downloadMobilityCSV() {
  const data = getMobilityExportData();
  if (!data.length) return alert("Tidak ada data");

  const headers = [
    "Nama",
    "Jenis",
    "Tipe",
    "Kampus",
    "Negara",
    "Tanggal Mulai",
    "Tanggal Selesai",
    "Masa Study",
  ];

  const rows = data.map((p) => [
    p.nama,
    p.jenis,
    p.type,
    p.kampus,
    p.negara,
    p.tahunMasuk,
    p.tahunKeluar,
    p.masaStudy,
  ]);

  let csvContent =
    headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Data_Mobilitas_UNIDA.csv";
  link.click();
}
function downloadMobilityExcel() {
  const data = getMobilityExportData();
  if (!data.length) return alert("Tidak ada data");

  let table = `
    <table>
      <tr>
        <th>Nama</th>
        <th>Jenis</th>
        <th>Tipe</th>
        <th>Kampus</th>
        <th>Negara</th>
        <th>Mulai</th>
        <th>Selesai</th>
        <th>Masa Study</th>
      </tr>
  `;

  data.forEach((p) => {
    table += `
      <tr>
        <td>${p.nama}</td>
        <td>${p.jenis}</td>
        <td>${p.type}</td>
        <td>${p.kampus}</td>
        <td>${p.negara}</td>
        <td>${p.tahunMasuk}</td>
        <td>${p.tahunKeluar}</td>
        <td>${p.masaStudy}</td>
      </tr>
    `;
  });

  table += "</table>";

  const blob = new Blob([table], {
    type: "application/vnd.ms-excel",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Data_Mobilitas_UNIDA.xls";
  link.click();
}
function downloadMobilityPDF() {
  const data = getMobilityExportData();
  if (!data.length) return alert("Tidak ada data");

  let html = `
    <html>
    <head>
      <style>
        body { font-family: Arial; padding:20px; }
        table { border-collapse: collapse; width:100%; }
        th, td { border:1px solid #ddd; padding:6px; font-size:12px; }
        th { background:#2563EB; color:white; }
      </style>
    </head>
    <body>
      <h2>Data Program Mobilitas Internasional</h2>
      <table>
        <tr>
          <th>Nama</th>
          <th>Jenis</th>
          <th>Tipe</th>
          <th>Kampus</th>
          <th>Negara</th>
          <th>Periode</th>
          <th>Masa Study</th>
        </tr>
  `;

  data.forEach((p) => {
    html += `
      <tr>
        <td>${p.nama}</td>
        <td>${p.jenis}</td>
        <td>${p.type}</td>
        <td>${p.kampus}</td>
        <td>${p.negara}</td>
        <td>${p.tahunMasuk} - ${p.tahunKeluar}</td>
        <td>${p.masaStudy}</td>
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
