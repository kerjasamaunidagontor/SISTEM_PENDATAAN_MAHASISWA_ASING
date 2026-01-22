/* ===============================
   DATA MITRA (MOCK / API READY)
================================ */
let MITRA = [];
let MITRA_GROUPED = [];
let MITRA_FILTERED = [];

function buildMitraFromKegiatan() {
  if (!Array.isArray(KEGIATAN)) {
    MITRA = [];
    return;
  }

  MITRA = KEGIATAN.map((k) => ({
    mitra: k.no || "-",
    mitraTerkait: k.mitra || "-",
    namaKegiatan: k.bentuk || k.deskripsi || "-",
    jenisDokumen: k.jenisDokumen || "-",
    tanggal: k.tanggal || "",
    pj: k.pj || "-",
    tingkat: k.tingkat || "-",
    fakultas: k.fakultas || "-",
    jenisMitra: k.jenisMitra || "-",
    linkSimkerma: k.linkSimkerma || "",
  }));

  console.log("MITRA built:", MITRA);
}
function renderMitraGroupedTable() {
  const tbody = document.getElementById("mitra-body");
  if (!tbody) return;

  if (!MITRA_FILTERED.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="p-4 text-center text-gray-500">
          Data mitra tidak ditemukan
        </td>
      </tr>`;
    return;
  }

  let html = "";

  MITRA_FILTERED.forEach((m, i) => {
    html += `
      <tr class="border-b bg-gray-50 font-medium">
        <td class="p-3">${m.mitra}</td>
        <td class="p-3">${m.tingkat || "-"}</td>
        <td class="p-3">${m.kegiatan.length} Kegiatan</td>
        <td class="p-3">${m.jenisMitra}</td>
        <td class="p-3 text-center">
          <button
            onclick="toggleMitraDetail(${i})"
            class="text-purple-600 hover:underline"
          >
            Detail
          </button>
        </td>
      </tr>

      <tr id="mitra-detail-${i}" class="hidden bg-white">
        <td colspan="5" class="p-4" data-loaded="0"></td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function renderMitraKegiatanList(list) {
  return `
    <table class="w-full text-sm border">
      <thead class="bg-gray-100">
        <tr>
          <th class="p-2 text-left">Mitra Terkait</th>
          <th class="p-2 text-left">Nama Kegiatan</th>
          <th class="p-2">Tanggal</th>
          <th class="p-2">PJ</th>
          <th class="p-2">Jenis Dokumen</th>
          <th class="p-2">SIMKERMA</th>
        </tr>
      </thead>
      <tbody>
        ${list
          .map(
            (k) => `
          <tr class="border-t">
            <td class="p-2">${k.mitra}</td>
            <td class="p-2">${k.nama}</td>
            <td class="p-2">${k.tanggal ? formatTanggal(k.tanggal) : "-"}</td>
            <td class="p-2">${k.pj}</td>
            <td class="p-2">${k.jenisDokumen}</td>
            <td class="p-2">
              ${
                k.linkSimkerma
                  ? `<a href="${k.linkSimkerma}" target="_blank"
                       class="text-blue-600 underline">Buka</a>`
                  : "-"
              }
            </td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}
function toggleMitraDetail(index) {
  const row = document.getElementById(`mitra-detail-${index}`);
  if (!row) return;

  const cell = row.querySelector("td");
  const mitra = MITRA_FILTERED[index];

  if (cell.dataset.loaded === "0") {
    cell.innerHTML = renderMitraKegiatanList(mitra.kegiatan);
    cell.dataset.loaded = "1";
  }

  row.classList.toggle("hidden");
}

function loadMitraPage() {
  console.log("loadMitraPage() dipanggil");

  if (!Array.isArray(KEGIATAN) || !KEGIATAN.length) return;

  buildMitraGroupedFromKegiatan();
  renderMitraGroupedTable();
}

/* ===============================
   BUAT GRUP MITRA
================================ */
function buildMitraGroupedFromKegiatan() {
  const map = {};

  KEGIATAN.forEach((k) => {
    const namaMitra =
      k.no !== undefined && k.no !== null ? String(k.no).trim() : "";

    if (!namaMitra) return;

    if (!map[namaMitra]) {
      map[namaMitra] = {
        mitra: namaMitra,
        tingkat: k.tingkat || "-",
        jenisMitra: k.jenisMitra || "-",
        fakultas: k.fakultas || "-",
        kegiatan: [],
      };
    }

    map[namaMitra].kegiatan.push({
      nama: k.bentuk || k.deskripsi || "-",
      tanggal: k.tanggal || "",
      pj: k.pj || "-",
      mitra: k.mitra || "-",
      jenisDokumen: k.jenisDokumen || "-",
      linkSimkerma: k.linkSimkerma || "",
    });
  });

  MITRA_GROUPED = Object.values(map);
  MITRA_FILTERED = [...MITRA_GROUPED];

  console.log("MITRA_GROUPED:", MITRA_GROUPED);
}

/* ===============================
   UNTUK FILTER 
=================================*/
function applyMitraFilter() {
  const keyword =
    document.getElementById("mitra-search")?.value.toLowerCase() || "";
  const jenis = document.getElementById("mitra-filter-jenis")?.value || "";

  MITRA_FILTERED = MITRA_GROUPED.filter((m) => {
    const matchJenis = !jenis || m.jenisMitra === jenis;

    const matchKeyword =
      m.mitra.toLowerCase().includes(keyword) ||
      m.kegiatan.some(
        (k) =>
          k.nama.toLowerCase().includes(keyword) ||
          k.pj.toLowerCase().includes(keyword),
      );

    return matchJenis && matchKeyword;
  });

  renderMitraGroupedTable();
}

/* ===============================
   UTIL
================================ */
function formatTanggal(val) {
  if (!val) return "-";
  return new Date(val).toLocaleDateString("id-ID");
}