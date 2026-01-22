/* ===============================
   DATA KEGIATAN (MOCK)
=============================== */
let KEGIATAN = [];

/* ===============================
   CONFIG
=============================== */
let KEGIATAN_PAGE = 1;
const KEGIATAN_PER_PAGE = 50;

/* ===============================
   FILTER + SEARCH
=============================== */
function applyKegiatanFilter() {
  KEGIATAN_PAGE = 1;
  renderKegiatanTable();
}

function getFilteredKegiatan() {
  const keyword =
    document.getElementById("search-kegiatan")?.value.toLowerCase() || "";
  const bidang = document.getElementById("filter-kegiatan")?.value || "";

  return KEGIATAN.filter((k) => {
    const matchBidang = !bidang || k.bidang === bidang;

    const matchSearch = Object.values(k).some((v) =>
      String(v).toLowerCase().includes(keyword),
    );

    return matchBidang && matchSearch;
  });
}

/* ===============================
   RENDER TABLE
=============================== */
function renderKegiatanTable() {
  const tbody = document.getElementById("kegiatan-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  const data = getFilteredKegiatan();
  const start = (KEGIATAN_PAGE - 1) * KEGIATAN_PER_PAGE;
  const pageData = data.slice(start, start + KEGIATAN_PER_PAGE);

  if (!pageData.length) {
    tbody.innerHTML = `
    <tr>
      <td colspan="9" class="p-4 text-center text-gray-500">
        Data tidak ditemukan
      </td>
    </tr>`;
    return;
  }

  pageData.forEach((k, i) => {
    tbody.innerHTML += `
      <tr class="border-b hover:bg-gray-50">
        <td class="p-3">${k.pj}</td>
        <td class="p-3">${k.bidang}</td>
        <td class="p-3">${k.bentuk}</td>
        <td class="p-3">${k.tingkat}</td>
        <td class="p-3">${formatTanggal(k.tanggal)}</td>
        <td class="p-3">${k.deskripsi}</td>
        <td class="p-3">${k.mitra}</td>
        <td class="p-3">${k.status}</td>
        <td
  class="p-2 text-center w-20 whitespace-nowrap
         sticky right-0 bg-white z-10"
>
  <div class="flex justify-center gap-2">
  <button
    onclick="openKegiatanDetail(${k.row})"
    title="Detail"
    class="w-8 h-8 flex items-center justify-center rounded-lg
           bg-green-100 text-green-600
           hover:bg-green-200 transition"
  >
    🔍
  </button>

  <button
    onclick="deleteKegiatan(${k.row})"
    title="Hapus"
    class="w-8 h-8 flex items-center justify-center rounded-lg
           bg-red-100 text-red-600
           hover:bg-red-200 transition"
  >
    🗑️
  </button>
</div>

</td>

      </tr>
    `;
  });

  renderKegiatanPagination(data.length);
}

function openKegiatanForm() {
  populateNoDropdown(); // ← INI KUNCINYA

  const modal = document.getElementById("kegiatan-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeKegiatanForm() {
  const modal = document.getElementById("kegiatan-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");

  document.getElementById("kegiatanIndex").value = "";
  modal
    .querySelectorAll("input, textarea, select")
    .forEach((el) => (el.value = ""));
}
/* ===============================
   DETAIL KEGIATAN (FULL)
=============================== */
let DETAIL_INDEX = null;

function openKegiatanDetail(sheetRow) {
  console.log("Detail row:", sheetRow);
  console.log("KEGIATAN:", KEGIATAN);

  const k = KEGIATAN.find((x) => Number(x.row) === Number(sheetRow));

  if (!k) {
    alert("Data kegiatan tidak ditemukan");
    return;
  }
  DETAIL_INDEX = sheetRow;

  document.getElementById("kegiatan-detail-content").innerHTML = `
    <div><b>Mitra</b><br>${k.no || "-"}</div>
    <div><b>Mitra Terkait</b><br>${k.mitra || "-"}</div>

    <div><b>Tanggal</b><br>${formatTanggal(k.tanggal || "-")}</div>
    <div><b>Tingkat</b><br>${k.tingkat || "-"}</div>

    <div><b>Jenis Mitra</b><br>${k.jenisMitra || "-"}</div>
    <div><b>Jenis Dokumen</b><br>${k.jenisDokumen || "-"}</div>

    <div><b>Bentuk Kegiatan</b><br>${k.bentuk || "-"}</div>
    <div><b>Bidang</b><br>${k.bidang || "-"}</div>

    <div><b>Pendanaan</b><br>${k.pendanaan || "-"}</div>
    <div><b>Fakultas / Satker</b><br>${k.fakultas || "-"}</div>

    <div><b>Penanggung Jawab</b><br>${k.pj || "-"}</div>
    <div><b>Tahun</b><br>${k.tahun || "-"}</div>

    <div><b>Status</b><br>${k.status || "-"}</div>
    <div><b>SIMKERMA</b><br>${k.simkerma || "-"}</div>

    <div><b>Cek Laporan</b><br>${k.cekLaporan || "-"}</div>
    <div class="md:col-span-2">
      <b>Link SIMKERMA</b><br>
      ${
        k.linkSimkerma
          ? `<a href="${k.linkSimkerma}" target="_blank" class="text-blue-600 underline">Buka Link</a>`
          : "-"
      }
    </div>

    <div class="md:col-span-2">
      <b>Laporan Kegiatan</b><br>
      ${
        k.laporan
          ? `<a href="${k.laporan}" target="_blank" class="text-blue-600 underline">Buka Laporan</a>`
          : "-"
      }
    </div>

    <div class="md:col-span-2">
      <b>Dokumen Kegiatan</b><br>
      ${
        k.dokumen
          ? `<a href="${k.dokumen}" target="_blank" class="text-blue-600 underline">Buka Dokumen</a>`
          : "-"
      }
    </div>

    <div class="md:col-span-2">
      <b>Deskripsi</b><br>${k.deskripsi || "-"}
    </div>

    <div class="md:col-span-2">
      <b>Catatan</b><br>${k.catatan || "-"}
    </div>
  `;

  const modal = document.getElementById("kegiatan-detail-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeKegiatanDetail() {
  const modal = document.getElementById("kegiatan-detail-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}
function editFromDetail() {
  const k = KEGIATAN.find((x) => Number(x.row) === Number(DETAIL_INDEX));
  if (!k) return alert("Data tidak ditemukan");

  // isi dropdown No (Mitra) + auto select
  populateNoDropdown(k.no);

  closeKegiatanDetail();

  // lanjut ke mekanisme edit lama kamu
  editKegiatan(k.row);
  // ⬅️ set MITRA SETELAH form edit siap
  setMitraForEdit(k.no);
}

function editKegiatan(sheetRow) {
  bindKegiatanForm();

  const k = KEGIATAN.find((x) => Number(x.row) === Number(sheetRow));
  if (!k) return;

  document.getElementById("kegiatanIndex").value = sheetRow;

  k_no.value = k.no || "";
  k_mitra.value = k.mitra || "";
  k_tanggal.value = toInputDate(k.tanggal);
  k_tingkat.value = k.tingkat || "";
  k_jenis_mitra.value = k.jenisMitra || "";
  k_jenis_dokumen.value = k.jenisDokumen || "";
  k_bentuk.value = k.bentuk || "";
  k_bidang.value = k.bidang || "";
  k_pendanaan.value = k.pendanaan || "";
  k_fakultas.value = k.fakultas || "";
  k_pj.value = k.pj || "";
  k_tahun.value = k.tahun || "";
  k_status.value = k.status || "";
  k_simkerma.value = k.simkerma || "";
  k_cek_laporan.value = k.cekLaporan || "";
  k_link_simkerma.value = k.linkSimkerma || "";
  k_laporan.value = k.laporan || "";
  k_dokumen.value = k.dokumen || "";
  k_deskripsi.value = k.deskripsi || "";
  k_catatan.value = k.catatan || "";

  document.getElementById("kegiatan-modal").classList.remove("hidden");
  document.getElementById("kegiatan-modal").classList.add("flex");
}

async function saveKegiatan() {
  const index = document.getElementById("kegiatanIndex").value;
  const isCreate = index === "";

  const payload = {
    action: isCreate ? "create" : "update",
    sheet: "INPUT KEGIATAN",
    row: isCreate ? undefined : Number(index),
    data: {
      no: k_no.value,
      mitra: k_mitra.value,
      tanggal: fromInputDate(k_tanggal.value),
      tingkat: k_tingkat.value,
      jenisMitra: k_jenis_mitra.value,
      jenisDokumen: k_jenis_dokumen.value,
      bentuk: k_bentuk.value,
      bidang: k_bidang.value,
      pendanaan: k_pendanaan.value,
      fakultas: k_fakultas.value,
      pj: k_pj.value,
      tahun: k_tahun.value,
      status: k_status.value,
      simkerma: k_simkerma.value,
      cekLaporan: k_cek_laporan.value,
      linkSimkerma: k_link_simkerma.value,
      laporan: k_laporan.value,
      dokumen: k_dokumen.value,
      deskripsi: k_deskripsi.value,
      catatan: k_catatan.value,
    },
  };

  try {
    await fetch(API.kegiatan, {
      method: "POST",
      mode: "no-cors", // 🔥 WAJIB (frontend lokal)
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    await loadKegiatanFromSheet(); // 🔄 validasi dari sheet
    closeKegiatanForm();
  } catch (err) {
    console.error("saveKegiatan error:", err);
    alert("Gagal menyimpan kegiatan");
  }
}

async function deleteKegiatan(sheetRow) {
  if (!confirm("Hapus kegiatan ini?")) return;

  await fetch(API.kegiatan, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "delete",
      sheet: "INPUT KEGIATAN",
      row: Number(sheetRow),
    }),
  });

  await loadKegiatanFromSheet();
}
function toInputDate(val) {
  if (!val) return "";

  // 1️⃣ Kalau Date object
  if (val instanceof Date && !isNaN(val)) {
    return val.toISOString().split("T")[0];
  }

  // 2️⃣ Kalau number (serial / timestamp)
  if (typeof val === "number") {
    const d = new Date(val);
    if (!isNaN(d)) return d.toISOString().split("T")[0];
  }

  // 3️⃣ Kalau string
  if (typeof val === "string") {
    val = val.trim();

    // sudah format input
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;

    // ISO
    if (!isNaN(Date.parse(val))) {
      const d = new Date(val);
      return d.toISOString().split("T")[0];
    }

    // MM/DD/YYYY
    const p = val.split("/");
    if (p.length === 3) {
      const mm = p[0].padStart(2, "0");
      const dd = p[1].padStart(2, "0");
      const yyyy = p[2].length === 2 ? "20" + p[2] : p[2];
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  console.warn("Tanggal tidak dikenali:", val);
  return "";
}
function fromInputDate(val) {
  if (!val) return "";
  const [y, m, d] = val.split("-");
  return `${m}/${d}/${y}`;
}

async function loadKegiatanFromSheet() {
  try {
    const res = await fetch(API.kegiatan);
    if (!res.ok) throw new Error("HTTP " + res.status);

    const json = await res.json();
    KEGIATAN = Array.isArray(json) ? json : [];

    console.log("KEGIATAN from sheet:", KEGIATAN);

    renderKegiatanTable();

    // 🔥 BUILD MITRA SETELAH KEGIATAN PASTI ADA
    if (typeof buildMitraFromKegiatan === "function") {
      buildMitraFromKegiatan();
      renderMitraGroupedTable();
    }
  } catch (err) {
    console.error("loadKegiatanFromSheet error:", err);
    KEGIATAN = [];
    renderKegiatanTable();
  }
}

/* ===============================
   BAGIAN DROPDOWN DARI KERJASAMA.JS KE KEGIATAN.JS
================================ */
function populateNoDropdown() {
  const dropdown = document.getElementById("k-no-dropdown");
  dropdown.innerHTML = "";

  if (!window.KERJASAMA || window.KERJASAMA.length === 0) return;

  const uniqueMitra = new Set();

  window.KERJASAMA.forEach((k) => {
    if (!k.mitra) return;

    const nama = k.mitra.trim();
    if (uniqueMitra.has(nama)) return; // ⛔ skip duplikat

    uniqueMitra.add(nama);

    const div = document.createElement("div");
    div.textContent = nama;
    div.className = "px-3 py-2 cursor-pointer hover:bg-purple-100";

    div.onclick = () => {
      document.getElementById("k-no-search").value = nama;
      document.getElementById("k-no").value = nama;
      toggleMitraDropdown(false);
    };

    dropdown.appendChild(div);
  });
}

function toggleMitraDropdown(show) {
  const dd = document.getElementById("k-no-dropdown");
  if (!dd) return;

  dd.classList.toggle("hidden", !show);
}

function filterMitraDropdown() {
  const q = document.getElementById("k-no-search").value.toLowerCase();
  const items = document.querySelectorAll("#k-no-dropdown div");

  items.forEach((item) => {
    item.style.display = item.textContent.toLowerCase().includes(q)
      ? "block"
      : "none";
  });
}
function setMitraForEdit(nama) {
  populateNoDropdown();

  const search = document.getElementById("k-no-search");
  const hidden = document.getElementById("k-no");

  search.value = nama || "";
  hidden.value = nama || "";

  toggleMitraDropdown(false);
}

/* ===============================
   PAGINATION KEGIATAN (ADVANCED)
=============================== */
function renderKegiatanPagination(total) {
  const pagination = document.getElementById("kegiatan-pagination");
  const info = document.getElementById("kegiatan-info");

  const pageCount = Math.ceil(total / KEGIATAN_PER_PAGE);
  if (!pagination || !info) return;

  pagination.innerHTML = "";

  info.textContent = total
    ? `Menampilkan ${(KEGIATAN_PAGE - 1) * KEGIATAN_PER_PAGE + 1}
       - ${Math.min(
         KEGIATAN_PAGE * KEGIATAN_PER_PAGE,
         total,
       )} dari ${total} data`
    : "Menampilkan 0 data";

  const maxVisible = 5;
  let start = Math.max(1, KEGIATAN_PAGE - Math.floor(maxVisible / 2));
  let end = Math.min(pageCount, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  // ⬅ Prev
  pagination.innerHTML += `
    <button onclick="goToKegiatanPage(${Math.max(1, KEGIATAN_PAGE - 1)})"
      class="px-3 py-1 border rounded-lg hover:bg-gray-100">
      ◀
    </button>
  `;

  // Page 1
  if (start > 1) {
    pagination.innerHTML += kegiatanPageButton(1);
    if (start > 2) pagination.innerHTML += kegiatanEllipsis();
  }

  // Middle pages
  for (let i = start; i <= end; i++) {
    pagination.innerHTML += kegiatanPageButton(i);
  }

  // Last page
  if (end < pageCount) {
    if (end < pageCount - 1) pagination.innerHTML += kegiatanEllipsis();
    pagination.innerHTML += kegiatanPageButton(pageCount);
  }

  // Next ➡
  pagination.innerHTML += `
    <button onclick="goToKegiatanPage(${Math.min(
      pageCount,
      KEGIATAN_PAGE + 1,
    )})"
      class="px-3 py-1 border rounded-lg hover:bg-gray-100">
      ▶
    </button>
  `;
}

/* ===============================
   PAGINATION UTIL KEGIATAN
=============================== */
function kegiatanPageButton(page) {
  return `
    <button onclick="goToKegiatanPage(${page})"
      class="px-3 py-1 rounded-lg border
      ${
        page === KEGIATAN_PAGE
          ? "bg-purple-600 text-white"
          : "hover:bg-gray-100"
      }">
      ${page}
    </button>
  `;
}

function kegiatanEllipsis() {
  return `<span class="px-2 text-gray-400">...</span>`;
}

function goToKegiatanPage(page) {
  KEGIATAN_PAGE = page;
  renderKegiatanTable();
}

function bindKegiatanForm() {
  window.k_no = document.getElementById("k-no");
  window.k_mitra = document.getElementById("k-mitra");
  window.k_tanggal = document.getElementById("k-tanggal");
  window.k_tingkat = document.getElementById("k-tingkat");
  window.k_jenis_mitra = document.getElementById("k-jenis-mitra");
  window.k_jenis_dokumen = document.getElementById("k-jenis-dokumen");
  window.k_bentuk = document.getElementById("k-bentuk");
  window.k_bidang = document.getElementById("k-bidang");
  window.k_pendanaan = document.getElementById("k-pendanaan");
  window.k_fakultas = document.getElementById("k-fakultas");
  window.k_pj = document.getElementById("k-pj");
  window.k_tahun = document.getElementById("k-tahun");
  window.k_status = document.getElementById("k-status");
  window.k_simkerma = document.getElementById("k-simkerma");
  window.k_cek_laporan = document.getElementById("k-cek-laporan");
  window.k_link_simkerma = document.getElementById("k-link-simkerma");
  window.k_laporan = document.getElementById("k-laporan");
  window.k_dokumen = document.getElementById("k-dokumen");
  window.k_deskripsi = document.getElementById("k-deskripsi");
  window.k_catatan = document.getElementById("k-catatan");
}
/* ===============================
   CLOSE DROPDOWN SAAT KLIK LUAR
=============================== */
document.addEventListener("click", function (e) {
  const wrapper = document.getElementById("mitra-wrapper");
  if (!wrapper) return;

  if (!wrapper.contains(e.target)) {
    toggleMitraDropdown(false);
  }
});
