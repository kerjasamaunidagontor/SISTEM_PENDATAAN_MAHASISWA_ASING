/**
 * penerimaan.js - New admission data management
 */

window.admissions = window.admissions || [];
let currentAdmissionId = null;
let importedData = [];
let currentAdmissionPage = 1;
const admissionItemsPerPage = 20;

function parseAdmissionDate(value) {
  if (!value) return null;

  // 🔥 Excel serial number
  if (typeof value === "number" && value > 10000) {
    return excelDateToJSDate(value);
  }

  // 🔥 Excel serial dalam bentuk string
  if (typeof value === "string" && !isNaN(value) && Number(value) > 10000) {
    return excelDateToJSDate(Number(value));
  }

  // 🔥 Timestamp Google Form
  if (typeof value === "string") {
    const cleaned = value.replace("GMT+7", "").trim();
    const d = new Date(cleaned);
    if (!isNaN(d)) return d;
  }

  return null;
}

function handleImport() {
  const fileInput = document.getElementById("importExcel");
  const file = fileInput.files[0];
  if (!file) return alert("Pilih file dulu");

  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!json.length) {
      alert("File kosong!");
      return;
    }

    importedData = json;

    document.getElementById("importPreviewSection")?.classList.remove("hidden");

    renderPreview(json);
  };

  reader.readAsArrayBuffer(file);
}

function renderPreview(data) {
  const container = document.getElementById("previewTable");

  const headers = Object.keys(data[0]);

  container.innerHTML = `
    <table class="min-w-full text-xs border">
      <thead class="bg-gray-100 sticky top-0">
        <tr>
          ${headers
            .map(
              (h) => `
            <th class="border px-2 py-1 text-left">${h}</th>
          `,
            )
            .join("")}
        </tr>
      </thead>
      <tbody>
        ${data
          .slice(0, 10)
          .map(
            (row) => `
          <tr>
            ${headers
              .map((h) => {
                let value = row[h];

                // convert excel date
                if (typeof value === "number" && value > 40000) {
                  value = excelDateToJSDate(value).toLocaleString("id-ID");
                }

                return `<td class="border px-2 py-1">${value}</td>`;
              })
              .join("")}
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
    <p class="text-xs text-gray-500 p-2">
      Menampilkan 10 dari ${data.length} baris
    </p>
  `;
}

function validateImportedData(data) {
  const requiredFields = ["Full Name", "Email", "Nationality"];

  for (let i = 0; i < data.length; i++) {
    for (let field of requiredFields) {
      if (!data[i][field] || data[i][field].toString().trim() === "") {
        alert(`Baris ${i + 2} kosong di kolom ${field}`);
        return false;
      }
    }
  }

  return true;
}

async function uploadToServer(btn) {
  if (!importedData.length) {
    alert("Tidak ada data");
    return;
  }

  if (!validateImportedData(importedData)) return;

  // 🚫 cegah spam click
  if (btn.disabled) return;

  btn.disabled = true;
  const originalText = btn.innerHTML;
  btn.innerHTML = "⏳ Menyimpan...";

  try {
    const response = await fetch(window.API.penerimaan, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "bulkCreate",
        sheet: "DATA CALON MAHASISWA ASING",
        rows: importedData,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    alert(`✅ ${importedData.length} data berhasil diupload!`);

    importedData = [];
    document.getElementById("importExcel").value = "";
    document.getElementById("importPreviewSection")?.classList.add("hidden");

    // reload table
    await loadAdmissionsFromServer();
  } catch (err) {
    alert("❌ Error: " + err.message);
  } finally {
    // 🔥 aktifkan lagi tombol
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}
async function loadAdmissionsFromServer() {
  try {
    const response = await fetch(window.API.penerimaan, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "getAll",
        sheet: "DATA CALON MAHASISWA ASING",
      }),
    });

    const result = await response.json();

    if (!result.success) {
      alert("❌ Gagal ambil data: " + result.error);
      return;
    }

    // 🔥 MERGE MAPPING TANPA MERUSAK STRUKTUR LAMA
    window.admissions = result.data.map((row) => {
      // 🔥 kumpulkan semua link dokumen otomatis
      const documentFields = [
        "Curriculum Vitae (CV)",
        "Active Passport",
        "ID Card",
        "Affidavite Letter",
        "Secondary School Certificate",
        "Secondary School Transcript",
        "Bachelor Certificate",
        "Bachelor Transcript",
        "Master Certificate",
        "Master Transcript",
        "Research Proposal",
        "Additional Document",
        "Other Supporting Documents",
      ];

      const documents = documentFields
        .filter((field) => row[field])
        .map((field) => ({
          label: field,
          url: row[field],
        }));

      return {
        id: row.row,
        name: row["Full Name"] || "",
        country: row["Nationality"] || "",
        email: row["Email"] || "",
        phone: row["Phone Number (Whatsapp)"] || "",
        prodi: row["First Choice (Faculty - Department)"] || "",
        date: row["Timestamp"] || "",
        status: row.status || "pending",
        note: row.note || "",
        documents,
      };
    });

    updateAdmissionStats();
    populateYearFilter();
    renderAdmissionTable();
    updateDashboardAdmissionCount();
  } catch (err) {
    alert("❌ Error koneksi: " + err.message);
  }
}
function updateDashboardAdmissionCount() {
  const el = document.getElementById("newAdmissionsCount");
  if (!el) return;

  el.textContent = admissions.length;
}
function initPenerimaan() {
  document
  .getElementById("searchAdmission")
  ?.addEventListener("input", () => {
    currentAdmissionPage = 1;
    renderAdmissionTable();
  });

  document
    .getElementById("filterYear")
    ?.addEventListener("change", renderAdmissionTable);

  // 🔥 LOAD DATA REAL
  loadAdmissionsFromServer();
}

// Update stats cards
function updateAdmissionStats() {
  const stats = {
    pending: admissions.filter((a) => a.status === "pending").length,
    verified: admissions.filter((a) => a.status === "verified").length,
    process: admissions.filter((a) => a.status === "process").length,
    accepted: admissions.filter((a) => a.status === "accepted").length,
  };

  const pendingEl = document.getElementById("pendingCount");
  if (pendingEl) pendingEl.textContent = stats.pending;

  const verifiedEl = document.getElementById("verifiedCount");
  if (verifiedEl) verifiedEl.textContent = stats.verified;

  const processEl = document.getElementById("processCount");
  if (processEl) processEl.textContent = stats.process;

  const acceptedEl = document.getElementById("acceptedCount");
  if (acceptedEl) acceptedEl.textContent = stats.accepted;
}

// Render table
function renderAdmissionTable() {
  const tbody = document.getElementById("admissionTableBody");
  if (!tbody) return;

  const search = document
  .getElementById("searchAdmission")
  ?.value.toLowerCase() || "";

const yearFilter = document.getElementById("filterYear")?.value || "";

const filtered = admissions.filter((a) => {

  const textMatch =
    a.name.toLowerCase().includes(search) ||
    a.country.toLowerCase().includes(search) ||
    a.prodi.toLowerCase().includes(search) ||
    a.status.toLowerCase().includes(search);

  let matchYear = true;
  if (yearFilter) {
    const d = parseAdmissionDate(a.date);
    matchYear = d && d.getFullYear().toString() === yearFilter;
  }

  return textMatch && matchYear;
});

  const total = filtered.length;
  const pageCount = Math.ceil(total / admissionItemsPerPage);

  if (currentAdmissionPage > pageCount) {
    currentAdmissionPage = 1;
  }

  const start = (currentAdmissionPage - 1) * admissionItemsPerPage;
  const end = start + admissionItemsPerPage;

  const paginatedData = filtered.slice(start, end);

  tbody.innerHTML =
    paginatedData.length > 0
      ? paginatedData
          .map(
            (a, idx) => `
      <tr class="hover:bg-blue-50/30 cursor-pointer">
        <td class="px-4 py-3">${start + idx + 1}</td>
        <td class="px-4 py-3 font-medium">${a.name}</td>
        <td class="px-4 py-3 capitalize">${a.country}</td>
        <td class="px-4 py-3">${formatProdi(a.prodi)}</td>
        <td class="px-4 py-3 text-xs">${formatDate(a.date)}</td>
        <td class="px-4 py-3">
          <span class="status-badge status-${a.status}">
            ${formatAdmissionStatus(a.status)}
          </span>
        </td>
        <td class="px-4 py-3">
          <button 
            onclick="viewAdmission(${a.id})" 
            class="text-blue-600 hover:text-blue-800 text-lg"
          >
            👁️
          </button>
        </td>
      </tr>
    `,
          )
          .join("")
      : `<tr>
          <td colspan="7" class="px-4 py-8 text-center text-gray-400">
            Tidak ada data
          </td>
        </tr>`;

  renderAdmissionPagination(total);
  renderAdmissionInfo(total, start, end);
}
function renderAdmissionPagination(total) {
  const pagination = document.getElementById("admissionPagination");
  if (!pagination) return;

  const pageCount = Math.ceil(total / admissionItemsPerPage);
  pagination.innerHTML = "";

  if (pageCount <= 1) return;

  const maxVisible = 5;
  let start = Math.max(1, currentAdmissionPage - Math.floor(maxVisible / 2));
  let end = Math.min(pageCount, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  // Prev
  pagination.innerHTML += `
    <button onclick="goToAdmissionPage(${Math.max(
      1,
      currentAdmissionPage - 1,
    )})"
      class="px-3 py-1 border rounded-lg hover:bg-gray-100">
      ◀
    </button>
  `;

  // Page 1
  if (start > 1) {
    pagination.innerHTML += admissionPageButton(1);
    if (start > 2) pagination.innerHTML += admissionEllipsis();
  }

  // Middle pages
  for (let i = start; i <= end; i++) {
    pagination.innerHTML += admissionPageButton(i);
  }

  // Last page
  if (end < pageCount) {
    if (end < pageCount - 1) pagination.innerHTML += admissionEllipsis();
    pagination.innerHTML += admissionPageButton(pageCount);
  }

  // Next
  pagination.innerHTML += `
    <button onclick="goToAdmissionPage(${Math.min(
      pageCount,
      currentAdmissionPage + 1,
    )})"
      class="px-3 py-1 border rounded-lg hover:bg-gray-100">
      ▶
    </button>
  `;
}
function admissionPageButton(page) {
  return `
    <button onclick="goToAdmissionPage(${page})"
      class="px-3 py-1 border rounded-lg ${
        page === currentAdmissionPage
          ? "bg-blue-600 text-white"
          : "hover:bg-gray-100"
      }">
      ${page}
    </button>
  `;
}

function admissionEllipsis() {
  return `<span class="px-2">...</span>`;
}

function goToAdmissionPage(page) {
  currentAdmissionPage = page;
  renderAdmissionTable();
}

function renderAdmissionInfo(total, start, end) {
  const info = document.getElementById("admissionInfo");
  if (!info) return;

  if (total === 0) {
    info.textContent = "Tidak ada data";
    return;
  }

  info.textContent = `Menampilkan ${start + 1} - ${Math.min(
    end,
    total,
  )} dari ${total} data`;
}
function populateYearFilter() {
  const select = document.getElementById("filterYear");
  if (!select) return;

  const years = new Set();

  admissions.forEach((a) => {
    const d = parseAdmissionDate(a.date);
    if (d) years.add(d.getFullYear());
  });

  const sortedYears = [...years].sort((a, b) => b - a);

  select.innerHTML =
    `<option value="">Semua Tahun</option>` +
    sortedYears
      .map((y) => `<option value="${y}">${y}</option>`)
      .join("");
}
// View admission detail
function viewAdmission(id) {
  const adm = admissions.find((a) => Number(a.id) === Number(id));
  if (!adm) return;

  currentAdmissionId = id;

  document.getElementById("admName").textContent = adm.name;
  document.getElementById("admCountry").textContent =
    adm.country?.toUpperCase() || "-";
  document.getElementById("admEmail").textContent = adm.email || "-";
  document.getElementById("admPhone").textContent = adm.phone || "-";
  document.getElementById("admProdi").textContent =
    formatProdi(adm.prodi) || "-";
  document.getElementById("admDate").textContent = formatDate(adm.date) || "-";
  document.getElementById("admNote").value = adm.note || "";

  const docContainer = document.getElementById("admDocuments");
  docContainer.innerHTML = adm.documents?.length
    ? adm.documents
        .map(
          (doc) => `
        <div class="flex items-center gap-2 text-sm">
          <span>📄</span>
          <a href="${doc.url}" target="_blank"
             class="text-blue-600 hover:underline">
            ${doc.label}
          </a>
        </div>
      `,
        )
        .join("")
    : '<p class="text-sm text-gray-400">Tidak ada dokumen</p>';

  const modal = document.getElementById("admissionModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeAdmissionModal() {
  const modal = document.getElementById("admissionModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  currentAdmissionId = null;
}

// Update status
async function updateAdmissionStatus(newStatus, btn) {
  if (!currentAdmissionId) return;

  // 🚫 cegah double click
  if (btn.disabled) return;

  const buttonGroup = btn.parentElement.querySelectorAll("button");

  // 🔥 disable semua tombol
  buttonGroup.forEach((b) => (b.disabled = true));

  const originalText = btn.innerHTML;
  btn.innerHTML = "⏳ Menyimpan...";

  try {
    const response = await fetch(window.API.penerimaan, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "updateStatus",
        sheet: "DATA CALON MAHASISWA ASING",
        id: currentAdmissionId,
        status: newStatus,
        note: document.getElementById("admNote").value,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Gagal update");
    }

    // reload data
    await loadAdmissionsFromServer();

    closeAdmissionModal();

    alert("✅ Status berhasil diperbarui");
  } catch (err) {
    console.error(err);
    alert("❌ Error: " + err.message);
  } finally {
    // 🔥 aktifkan kembali tombol
    buttonGroup.forEach((b) => (b.disabled = false));
    btn.innerHTML = originalText;
  }
}

// Export to Excel (placeholder)
function exportToExcel() {
  alert(
    "📊 Fitur export Excel akan segera tersedia!\n\nData akan diekspor dalam format .xlsx",
  );
  // Implement with SheetJS: https://sheetjs.com/
}

// Import data (placeholder)
function importData() {
  alert(
    "📥 Fitur import data akan segera tersedia!\n\nFormat yang didukung: .xlsx, .csv",
  );
}

// Helpers
function formatAdmissionStatus(code) {
  const map = {
    pending: "Menunggu Verifikasi",
    verified: "Terverifikasi",
    process: "Dalam Proses",
    accepted: "Diterima",
    rejected: "Ditolak",
  };
  return map[code] || code;
}

function formatProdi(code) {
  const map = {
    "pendidikan-bahasa-arab": "Pendidikan B. Arab",
    "ekonomi-syariah": "Ekonomi Syariah",
    "hukum-tata-negara": "Hukum Tata Negara",
    "teknik-informatika": "Teknik Informatika",
  };
  return map[code] || code;
}
function formatDate(dateStr) {
  if (!dateStr) return "-";

  const d = parseAdmissionDate(dateStr);
  if (!d) return dateStr;

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function excelDateToJSDate(serial) {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);

  const fractional_day = serial - Math.floor(serial) + 0.0000001;

  let total_seconds = Math.floor(86400 * fractional_day);

  const seconds = total_seconds % 60;

  total_seconds -= seconds;

  const hours = Math.floor(total_seconds / (60 * 60));
  const minutes = Math.floor(total_seconds / 60) % 60;

  return new Date(
    date_info.getFullYear(),
    date_info.getMonth(),
    date_info.getDate(),
    hours,
    minutes,
    seconds,
  );
}
// === UNTUK DOWNLOAD PDF EXEL CSV === //
// === DOWNLOAD FILE === //
function toggleExportMenu() {
  const menu = document.getElementById("exportMenu");
  if (!menu) return;
  menu.classList.toggle("hidden");
}

function exportToPDF() {
  downloadAdmissionPDF();
}

function getAdmissionExportData() {
  const search =
    document.getElementById("searchAdmission")?.value.toLowerCase() || "";

  const yearFilter =
    document.getElementById("filterYear")?.value || "";

  const filtered = admissions.filter((a) => {
    const textMatch =
      a.name.toLowerCase().includes(search) ||
      a.country.toLowerCase().includes(search) ||
      a.prodi.toLowerCase().includes(search) ||
      a.status.toLowerCase().includes(search);

    let matchYear = true;

    if (yearFilter) {
      const d = parseAdmissionDate(a.date);
      matchYear = d && d.getFullYear().toString() === yearFilter;
    }

    return textMatch && matchYear;
  });

  return filtered;
}

// CSV
function downloadAdmissionCSV() {
  const data = getAdmissionExportData();
  if (!data.length) return alert("Tidak ada data");

  const headers = [
    "Nama",
    "Negara",
    "Prodi",
    "Email",
    "Phone",
    "Status",
    "Tanggal Daftar",
  ];

  const rows = data.map((a) => [
    a.name,
    a.country,
    formatProdi(a.prodi),
    a.email,
    a.phone,
    formatAdmissionStatus(a.status),
    formatDate(a.date),
  ]);

  let csvContent =
    headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Data_Penerimaan_Mahasiswa_Asing.csv";
  link.click();
}

// EXCEL
function downloadAdmissionExcel() {
  const data = getAdmissionExportData();
  if (!data.length) return alert("Tidak ada data");

  let table = `
    <table>
      <tr>
        <th>Nama</th>
        <th>Negara</th>
        <th>Prodi</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Status</th>
        <th>Tanggal Daftar</th>
      </tr>
  `;

  data.forEach((a) => {
    table += `
      <tr>
        <td>${a.name}</td>
        <td>${a.country}</td>
        <td>${formatProdi(a.prodi)}</td>
        <td>${a.email}</td>
        <td>${a.phone}</td>
        <td>${formatAdmissionStatus(a.status)}</td>
        <td>${formatDate(a.date)}</td>
      </tr>
    `;
  });

  table += "</table>";

  const blob = new Blob([table], {
    type: "application/vnd.ms-excel",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Data_Penerimaan_Mahasiswa_Asing.xls";
  link.click();
}

// PDF (print)
function downloadAdmissionPDF() {
  const data = getAdmissionExportData();
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
      <h2>Data Penerimaan Mahasiswa Asing</h2>
      <table>
        <tr>
          <th>Nama</th>
          <th>Negara</th>
          <th>Prodi</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Status</th>
          <th>Tanggal</th>
        </tr>
  `;

  data.forEach((a) => {
    html += `
      <tr>
        <td>${a.name}</td>
        <td>${a.country}</td>
        <td>${formatProdi(a.prodi)}</td>
        <td>${a.email}</td>
        <td>${a.phone}</td>
        <td>${formatAdmissionStatus(a.status)}</td>
        <td>${formatDate(a.date)}</td>
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
