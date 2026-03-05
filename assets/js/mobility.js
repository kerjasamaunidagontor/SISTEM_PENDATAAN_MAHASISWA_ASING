/**
 * mobility.js - International mobility management
 */

const MOBILITY_API = window.API.mobility;
let mobilityPrograms = [];
let currentMobilityPage = 1;
const mobilityItemsPerPage = 10;
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

  initMobilityCalendar();
  renderMobilityTable(1);
  updateMobilityStats();
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

          // 🔥 ISO untuk calendar
          startISO: rawStart,
          endISO: rawEnd,

          // 🔥 Indo untuk tabel
          tahunMasuk: formatTanggalIndo(rawStart),
          tahunKeluar: formatTanggalIndo(rawEnd),

          masaStudy: row["Masa Study"] || "",
          passport: row["No. Passport"] || "",
          gender: row["Jenis Kelamin"] || "",
        };
      });

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
// Render mobility table
function renderMobilityTable(page = 1, data = mobilityPrograms) {
  const tbody = document.getElementById("mobilityTableBody");
  if (!tbody) return;

  currentMobilityPage = page;

  const start = (page - 1) * mobilityItemsPerPage;
  const end = start + mobilityItemsPerPage;
  const paginatedData = data.slice(start, end);

  if (!paginatedData.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-6 text-gray-400">
          Tidak ada data ditemukan
        </td>
      </tr>
    `;
    renderMobilityPagination(data.length);
    return;
  }

  tbody.innerHTML = paginatedData
    .map(
      (p) => `
    <tr class="hover:bg-blue-50/30 transition">
      <td class="px-4 py-3 font-medium">${p.nama}</td>
      <td class="px-4 py-3 capitalize">${p.jenis}</td>
      <td class="px-4 py-3">${p.kampus}</td>
      <td class="px-4 py-3 text-xs">${p.tahunMasuk} - ${p.tahunKeluar}</td>
      <td class="px-4 py-3">${p.masaStudy || "-"}</td>
      <td class="px-4 py-3">${p.type}</td>
      <td class="px-4 py-3 flex gap-2">
        <button onclick="editMobility(${p.row})" class="text-blue-600 hover:scale-110 transition">✏️</button>
        <button onclick="deleteMobility(${p.row})" class="text-red-600 hover:scale-110 transition">🗑️</button>
      </td>
    </tr>
  `,
    )
    .join("");

  renderMobilityPagination(data.length);
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
// Upcoming events sidebar
function renderUpcomingEvents() {
  const container = document.getElementById("upcomingEvents");
  if (!container) return;

  const today = new Date();

  const upcoming = mobilityPrograms
    .filter((p) => p.endISO && new Date(p.endISO) >= today)
    .sort((a, b) => new Date(a.startISO) - new Date(b.startISO))
    .slice(0, 5);

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
  if (!modal) return;

  // ganti judul tanpa merubah struktur HTML
  const title = modal.querySelector("h3");
  if (title) {
    title.textContent = isEdit
      ? "Edit Program Mobilitas"
      : "Form Program Mobilitas";
  }

  if (isEdit && program) {
    document.getElementById("mobilityId").value = program.row;

    document.getElementById("type_program").value = program.type || "";
    document.getElementById("jenis_program").value = program.jenis || "";
    document.getElementById("kampus_asal").value = program.kampus || "";
    document.getElementById("nama").value = program.nama || "";

    // ==============================
    // PARSE TTL UNIVERSAL (BARU)
    // ==============================
    const ttlValue = program.ttl || "";
    parseTTLToForm(ttlValue);
    document.getElementById("ttl").value = ttlValue;

    setSelectValue("negara", program.negara);
    setSelectValue("fakultas_prodi_program", program.fakultas);
    setSelectValue("prodi_pj", program.prodiPJ);

    document.getElementById("tahun_masuk").value = convertToInputDate(
      program.startISO,
    );

    document.getElementById("tahun_keluar").value = convertToInputDate(
      program.endISO,
    );

    document.getElementById("masa_study").value = program.masaStudy || "";

    document.getElementById("no_passport").value = program.passport || "";

    document.getElementById("jenis_kelamin").value = program.gender || "Male";
  } else {
    document.getElementById("mobilityForm").reset();
    document.getElementById("mobilityId").value = "";
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.classList.add("overflow-hidden");
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

  // optional: disable scroll body
  document.body.classList.add("overflow-hidden");
}
// Form handler
async function handleMobilitySubmit(e) {
  e.preventDefault();

  const form = document.getElementById("mobilityForm");
  const submitBtn = form.querySelector("button[type='submit']");
  const rowId = document.getElementById("mobilityId").value;

  // 🚫 cegah double click
  if (submitBtn.disabled) return;

  submitBtn.disabled = true;
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = "⏳ Menyimpan...";

  try {
    // ==============================
    // GABUNG TTL
    // ==============================
    const tempat = document.getElementById("tempat_lahir").value;
    const tanggal = document.getElementById("tanggal_lahir").value;

    const ttlGabung =
      tempat && tanggal ? `${tempat}, ${tanggal}` : tempat || "";

    document.getElementById("ttl").value = ttlGabung;

    const payload = {
      action: "create",
      sheet: "DATA MAHASISWA NON DEGREE",

      type_program: document.getElementById("type_program").value,
      jenis_program: document.getElementById("jenis_program").value,
      kampus_asal: document.getElementById("kampus_asal").value,
      nama: document.getElementById("nama").value,
      ttl: ttlGabung,
      negara: document.getElementById("negara").value,
      fakultas_prodi_program: document.getElementById("fakultas_prodi_program")
        .value,
      prodi_pj: document.getElementById("prodi_pj").value,
      tahun_masuk: document.getElementById("tahun_masuk").value,
      tahun_keluar: document.getElementById("tahun_keluar").value,
      masa_study: document.getElementById("masa_study").value,
      no_passport: document.getElementById("no_passport").value,
      jenis_kelamin: document.getElementById("jenis_kelamin").value,
    };

    // 🔥 kalau edit → hapus dulu
    if (rowId) {
      await fetch(MOBILITY_API, {
        method: "POST",
        body: JSON.stringify({
          action: "delete",
          sheet: "DATA MAHASISWA NON DEGREE",
          row: rowId,
        }),
      });
    }

    // 🔥 create baru
    const res = await fetch(MOBILITY_API, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal menyimpan");
    }

    await loadMobilityFromAPI();

    document.getElementById("mobilityCalendar").innerHTML = "";
    initMobilityCalendar();

    renderMobilityTable(1);
    updateMobilityStats();

    closeMobilityModal();

    alert(
      rowId ? "✅ Data berhasil diupdate!" : "✅ Data berhasil ditambahkan!",
    );
  } catch (err) {
    console.error("Submit error:", err);
    alert("❌ Terjadi kesalahan saat menyimpan data");
  } finally {
    // 🔥 aktifkan kembali tombol
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
