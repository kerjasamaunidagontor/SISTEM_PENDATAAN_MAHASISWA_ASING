/**
 * penerimaan.js - New admission data management
 */

let admissions = [];
let currentAdmissionId = null;
let importedData = [];

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

    document
      .getElementById("importPreviewSection")
      ?.classList.remove("hidden");

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
          ${headers.map(h => `
            <th class="border px-2 py-1 text-left">${h}</th>
          `).join("")}
        </tr>
      </thead>
      <tbody>
        ${data.slice(0, 10).map(row => `
          <tr>
            ${headers.map(h => `
              <td class="border px-2 py-1">${row[h]}</td>
            `).join("")}
          </tr>
        `).join("")}
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

async function uploadToServer() {
  if (!importedData.length) {
    alert("Tidak ada data");
    return;
  }

  if (!validateImportedData(importedData)) return;

  try {
    const response = await fetch(window.API.penerimaan, {
  method: "POST",
  headers: {
    "Content-Type": "text/plain;charset=utf-8"
  },
  body: JSON.stringify({
    action: "bulkCreate",
    sheet: "DATA CALON MAHASISWA ASING",
    rows: importedData
  })
});

    const result = await response.json();

    if (result.success) {
      alert(`✅ ${importedData.length} data berhasil diupload!`);

      importedData = [];
      document.getElementById("importExcel").value = "";
      document
        .getElementById("importPreviewSection")
        ?.classList.add("hidden");

        // 🔥 reload table
  loadAdmissionsFromServer();

    } else {
      alert("❌ Gagal: " + result.error);
    }

  } catch (err) {
    alert("❌ Error koneksi: " + err.message);
  }
}
async function loadAdmissionsFromServer() {
  try {

    const response = await fetch(window.API.penerimaan, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "getAll",
        sheet: "DATA CALON MAHASISWA ASING"
      })
    });

    const result = await response.json();

    if (!result.success) {
      alert("❌ Gagal ambil data: " + result.error);
      return;
    }

    // 🔥 MERGE MAPPING TANPA MERUSAK STRUKTUR LAMA
    admissions = result.data.map(row => ({
      id: row.row, // nomor baris dari backend
      name: row["Full Name"] || "",
      country: row["Nationality"] || "",
      email: row["Email"] || "",
      phone: row["Phone Number (Whatsapp)"] || "",
      prodi: row["First Choice (Faculty - Department)"] || "",
      date: row["Timestamp"] || "",
      status: row.status || "pending",
      note: "",
      documents: []
    }));

    updateAdmissionStats();
    renderAdmissionTable();

  } catch (err) {
    alert("❌ Error koneksi: " + err.message);
  }
}
function initPenerimaan() {

  document
    .getElementById("filterStatus")
    ?.addEventListener("change", renderAdmissionTable);

  document
    .getElementById("filterDate")
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

  document.getElementById("pendingCount").textContent = stats.pending;
  document.getElementById("verifiedCount").textContent = stats.verified;
  document.getElementById("processCount").textContent = stats.process;
  document.getElementById("acceptedCount").textContent = stats.accepted;
}

// Render table
function renderAdmissionTable() {
  const tbody = document.getElementById("admissionTableBody");
  if (!tbody) return;

  const statusFilter = document.getElementById("filterStatus")?.value || "";
  const dateFilter = document.getElementById("filterDate")?.value || "";

  const filtered = admissions.filter((a) => {
    const matchStatus = !statusFilter || a.status === statusFilter;
    const matchDate = !dateFilter || a.date === dateFilter;
    return matchStatus && matchDate;
  });

  tbody.innerHTML =
    filtered
      .map(
        (a, idx) => `
    <tr class="hover:bg-blue-50/30 cursor-pointer" onclick="viewAdmission('${a.id}')">
      <td class="px-4 py-3">${idx + 1}</td>
      <td class="px-4 py-3 font-medium">${a.name}</td>
      <td class="px-4 py-3 capitalize">${a.country}</td>
      <td class="px-4 py-3">${formatProdi(a.prodi)}</td>
      <td class="px-4 py-3 text-xs">${formatDate(a.date)}</td>
      <td class="px-4 py-3"><span class="status-badge status-${a.status}">${formatAdmissionStatus(a.status)}</span></td>
      <td class="px-4 py-3">
        <button onclick="event.stopPropagation(); viewAdmission('${a.id}')" class="text-blue-600 hover:text-blue-800">👁️</button>
      </td>
    </tr>
  `,
      )
      .join("") ||
    '<tr><td colspan="7" class="px-4 py-8 text-center text-gray-400">Tidak ada data</td></tr>';
}

// View admission detail
function viewAdmission(id) {
  const adm = admissions.find((a) => a.id === id);
  if (!adm) return;

  currentAdmissionId = id;
  document.getElementById("admName").textContent = adm.name;
  document.getElementById("admCountry").textContent =
    adm.country?.toUpperCase();
  document.getElementById("admEmail").textContent = adm.email;
  document.getElementById("admPhone").textContent = adm.phone;
  document.getElementById("admProdi").textContent = formatProdi(adm.prodi);
  document.getElementById("admDate").textContent = formatDate(adm.date);
  document.getElementById("admNote").value = adm.note || "";

  // Documents
  const docContainer = document.getElementById("admDocuments");
  docContainer.innerHTML =
    adm.documents
      ?.map(
        (doc) => `
    <div class="flex items-center gap-2 text-sm">
      <span>📄</span>
      <a href="#" class="text-blue-600 hover:underline">${doc}</a>
    </div>
  `,
      )
      .join("") || '<p class="text-sm text-gray-400">Tidak ada dokumen</p>';

  // Show modal
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
async function updateAdmissionStatus(newStatus) {
  if (!currentAdmissionId) return;

  try {
    const response = await fetch(window.API.penerimaan, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action: "updateStatus",
        sheet: "DATA CALON MAHASISWA ASING",
        id: currentAdmissionId,
        status: newStatus,
        note: document.getElementById("admNote").value
      })
    });

    const result = await response.json();

    if (result.success) {
      alert("✅ Status berhasil diperbarui");
      loadAdmissionsFromServer();
      closeAdmissionModal();
    } else {
      alert("❌ Gagal update: " + result.error);
    }

  } catch (err) {
    alert("❌ Error koneksi: " + err.message);
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
