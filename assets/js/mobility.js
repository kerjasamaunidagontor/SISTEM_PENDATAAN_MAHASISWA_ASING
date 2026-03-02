/**
 * mobility.js - International mobility management
 */

const MOBILITY_API = window.API.mobility;
let mobilityPrograms = [];
let currentMobilityPage = 1;
const mobilityItemsPerPage = 10;

/* ===============================
   INIT
================================= */
async function initMobility() {
  await loadMobilityFromAPI();

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
      `${MOBILITY_API}&action=getAll&sheet=DATA MAHASISWA NON DEGREE`
    );

    const result = await res.json();

    if (result.success) {
      console.log("RAW DATA:", result.data[0]);

      mobilityPrograms = result.data.map((row) => {
  const rawStart =
    row["Tahun Masuk Mahasiswa"] || row.tahun_masuk || "";
  const rawEnd =
    row["Tahun Keluar Mahasiswa"] || row.tahun_keluar || "";

  return {
    row: row.row,
    no: row["No"] || "",
    type: (row["Type Program"] || "")
      .toString()
      .trim()
      .toLowerCase(),
    jenis: row["Jenis Program"] || "",
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

      updateMobilityStats();   // 🔥 penting
    }
  } catch (err) {
    console.error("Load mobility error:", err);
  }
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
      .filter(p => p.startISO)
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
      info.el.classList.add(
        "rounded-md",
        "text-xs",
        "font-medium",
        "px-1"
      );
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
function renderMobilityTable(page = 1) {
  const tbody = document.getElementById("mobilityTableBody");
  if (!tbody) return;

  currentMobilityPage = page;

  const start = (page - 1) * mobilityItemsPerPage;
  const end = start + mobilityItemsPerPage;
  const paginatedData = mobilityPrograms.slice(start, end);

  tbody.innerHTML = paginatedData
    .map(
      (p) => `
    <tr class="hover:bg-blue-50/30">
      <td class="px-4 py-3 font-medium">${p.nama}</td>
      <td class="px-4 py-3 capitalize">${p.jenis}</td>
      <td class="px-4 py-3">${p.kampus}</td>
      <td class="px-4 py-3 text-xs">${p.tahunMasuk} - ${p.tahunKeluar}</td>
      <td class="px-4 py-3">${p.masaStudy || "-"}</td>
      <td class="px-4 py-3">${p.type}</td>
      <td class="px-4 py-3 flex gap-2">
  <button onclick="editMobility(${p.row})" class="text-blue-600">✏️</button>
  <button onclick="deleteMobility(${p.row})" class="text-red-600">🗑️</button>
</td>
    </tr>
  `,
    )
    .join("");

  renderMobilityPagination(mobilityPrograms.length);
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
    `
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
  let start = Math.max(
    1,
    currentMobilityPage - Math.floor(maxVisible / 2),
  );
  let end = Math.min(pageCount, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  // ⬅ Prev
  pagination.innerHTML += `
    <button onclick="goToMobilityPage(${Math.max(
      1,
      currentMobilityPage - 1,
    )})"
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
    p.type?.toLowerCase().includes("outbound")
  ).length;

  const inbound = mobilityPrograms.filter((p) =>
    p.type?.toLowerCase().includes("inbound")
  ).length;

  const partners = new Set(
    mobilityPrograms.map((p) => p.kampus?.trim()).filter(Boolean)
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
    document.getElementById("ttl").value = program.ttl || "";
    document.getElementById("negara").value = program.negara || "";
    document.getElementById("fakultas_prodi_program").value =
      program.fakultas || "";
    document.getElementById("prodi_pj").value = program.prodiPJ || "";

    document.getElementById("tahun_masuk").value =
      convertToInputDate(program.startISO);

    document.getElementById("tahun_keluar").value =
      convertToInputDate(program.endISO);

    document.getElementById("masa_study").value =
      program.masaStudy || "";

    document.getElementById("no_passport").value =
      program.passport || "";

    document.getElementById("jenis_kelamin").value =
      program.gender || "Male";
  } else {
    document.getElementById("mobilityForm").reset();
    document.getElementById("mobilityId").value = "";
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.classList.add("overflow-hidden");
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

  const rowId = document.getElementById("mobilityId").value;

  const payload = {
  action: "create",
  sheet: "DATA MAHASISWA NON DEGREE",

  type_program: document.getElementById("type_program").value,
  jenis_program: document.getElementById("jenis_program").value,
  kampus_asal: document.getElementById("kampus_asal").value,
  nama: document.getElementById("nama").value,
  ttl: document.getElementById("ttl").value,
  negara: document.getElementById("negara").value,
  fakultas_prodi_program: document.getElementById("fakultas_prodi_program").value,
  prodi_pj: document.getElementById("prodi_pj").value,
  tahun_masuk: document.getElementById("tahun_masuk").value,
  tahun_keluar: document.getElementById("tahun_keluar").value,
  masa_study: document.getElementById("masa_study").value,
  no_passport: document.getElementById("no_passport").value,

  tahun_masuk_2: "",
  tahun_keluar_2: "",
  report_izin: "",

  scan_passport: document.getElementById("scan_passport").value,
  foto: document.getElementById("foto").value,
  file_loa: document.getElementById("file_loa").value,

  reguler_kmi: document.getElementById("reguler_kmi").value,
  jenis_kelamin: document.getElementById("jenis_kelamin").value,
};

  try {

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

    // 🔥 lalu create
    await fetch(MOBILITY_API, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    // ==============================
    // TARUH DI SINI
    // ==============================

    await loadMobilityFromAPI();

    document.getElementById("mobilityCalendar").innerHTML = "";
    initMobilityCalendar();

    renderMobilityTable(1);
    updateMobilityStats();

    closeMobilityModal();

    alert(rowId ? "✅ Data berhasil diupdate!" : "✅ Data berhasil ditambahkan!");

  } catch (err) {
    console.error("Submit error:", err);
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

  const date = new Date(dateString);

  // 🔥 CEK VALID
  if (isNaN(date.getTime())) {
    console.warn("Invalid date detected:", dateString);
    return "";
  }

  return date.toISOString().split("T")[0];
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
    p.type?.toLowerCase().includes("outbound")
  ).length;

  const inbound = mobilityPrograms.filter((p) =>
    p.type?.toLowerCase().includes("inbound")
  ).length;

  return outbound + inbound;
}