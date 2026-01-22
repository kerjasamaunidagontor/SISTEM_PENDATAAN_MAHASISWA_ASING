/* ===============================
   DATA KERJASAMA (MOCK)
=============================== */
window.KERJASAMA = [];

async function loadKerjasamaFromSheet() {
  try {
    const res = await fetch(API.kerjasama);
    if (!res.ok) throw new Error("HTTP " + res.status);

    const json = await res.json();
    KERJASAMA = Array.isArray(json) ? json : json.data || [];

    console.log("KERJASAMA from sheet:", KERJASAMA);
    renderKerjasamaTable();
  } catch (err) {
    console.error("loadKerjasamaFromSheet error:", err);
    KERJASAMA = [];
    renderKerjasamaTable();
  }
}

/* ===============================
   CONFIG SEARCH & PAGINATION
=============================== */
let CURRENT_PAGE = 1;
const PER_PAGE = 50;
let SEARCH_KEY = "";

/* ===============================
   SEARCH
=============================== */
function handleSearch() {
  SEARCH_KEY = document.getElementById("searchKerjasama").value.toLowerCase();
  CURRENT_PAGE = 1;
  renderKerjasamaTable();
}

function getFilteredData() {
  if (!SEARCH_KEY) return KERJASAMA;
  return KERJASAMA.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(SEARCH_KEY),
    ),
  );
}
/* ===============================
   GROUP BY MITRA
=============================== */
function groupKerjasamaByMitra(data) {
  return data.reduce((acc, d) => {
    const key = d.mitra || "Tanpa Mitra";
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});
}

/* ===============================
   RENDER TABLE
=============================== */
function renderKerjasamaTable() {
  const tbody = document.getElementById("kerjasama-body");
  if (!tbody) return;

  const filtered = getFilteredData();

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="p-4 text-center text-gray-500">
          Data tidak ditemukan
        </td>
      </tr>`;
    renderPagination(0);
    return;
  }

  // ===============================
  // GROUP BY MITRA
  // ===============================
  const grouped = groupKerjasamaByMitra(filtered);
  const mitraList = Object.keys(grouped);

  // ===============================
  // PAGINATION (PER MITRA)
  // ===============================
  const total = mitraList.length;
  const start = (CURRENT_PAGE - 1) * PER_PAGE;
  const pageMitra = mitraList.slice(start, start + PER_PAGE);

  // ===============================
  // RENDER (STRING BUFFER)
  // ===============================
  let html = "";

  pageMitra.forEach((mitra) => {
    const items = grouped[mitra];
    const first = items[0];
    const safeMitra = mitra.replace(/"/g, "&quot;");

    // 🔹 BARIS RINGKASAN MITRA
    html += `
      <tr class="bg-purple-50 font-semibold">
        <td class="p-3">${mitra}</td>
        <td class="p-3">${first.benua || "-"}</td>
        <td class="p-3">${first.negara || "-"}</td>
        <td class="p-3">${items.length} Kerjasama</td>
        <td class="p-3">${first.jenisMitra || "-"}</td>
        <td class="p-2 text-center">
          <button
            data-mitra="${safeMitra}"
            class="btn-toggle px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs"
          >
            Detail
          </button>
        </td>
      </tr>
    `;

    // 🔹 BARIS DETAIL (HIDDEN DEFAULT)
    for (let i = 0; i < items.length; i++) {
      const d = items[i];
      html += `
        <tr class="border-b bg-gray-50 mitra-detail hidden"
            data-mitra="${safeMitra}">
          <td class="p-3 pl-6 text-sm">* ${d.mitraTerkait || "-"}</td>
          <td class="p-3 text-sm">${d.noSurat}</td>
          <td class="p-3 text-sm">${d.jenisDokumen}</td>
          <td class="p-3 text-sm">${d.tingkat}</td>
          <td class="p-3 text-sm">${d.status}</td>
          <td class="p-3 text-sm">
            ${d.tahunMulai} – ${d.tahunBerakhir}
            <div class="flex gap-2 mt-1">
              <button
                onclick="openDetailKerjasama(${d.row})"
                class="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-lg"
              >🔍</button>
              <button
                onclick="deleteKerjasama(${d.row})"
                class="w-7 h-7 bg-red-100 text-red-600 rounded-lg"
              >🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }
  });

  // 🔥 1x DOM UPDATE
  tbody.innerHTML = html;

  bindToggleButtons();
  renderPagination(total);
}

function bindToggleButtons() {
  document.querySelectorAll(".btn-toggle").forEach((btn) => {
    btn.onclick = () => {
      const mitra = btn.dataset.mitra;
      document
        .querySelectorAll(`.mitra-detail[data-mitra="${mitra}"]`)
        .forEach((row) => row.classList.toggle("hidden"));
    };
  });
}

/* ===============================
   PAGINATION
=============================== */
function renderPagination(total) {
  const pagination = document.getElementById("pagination");
  const info = document.getElementById("pagination-info");

  const pageCount = Math.ceil(total / PER_PAGE);
  if (!pagination || !info) return;

  pagination.innerHTML = "";

  info.textContent = total
    ? `Menampilkan ${(CURRENT_PAGE - 1) * PER_PAGE + 1}
       - ${Math.min(CURRENT_PAGE * PER_PAGE, total)} dari ${total} data`
    : "Menampilkan 0 data";

  const maxVisible = 5; // jumlah tombol tengah
  let start = Math.max(1, CURRENT_PAGE - Math.floor(maxVisible / 2));
  let end = Math.min(pageCount, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  // ⬅ Prev
  pagination.innerHTML += `
    <button onclick="goToPage(${Math.max(1, CURRENT_PAGE - 1)})"
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
    <button onclick="goToPage(${Math.min(pageCount, CURRENT_PAGE + 1)})"
      class="px-3 py-1 border rounded-lg hover:bg-gray-100">
      ▶
    </button>
  `;
}
function pageButton(page) {
  return `
    <button onclick="goToPage(${page})"
      class="px-3 py-1 rounded-lg border
      ${
        page === CURRENT_PAGE ? "bg-purple-600 text-white" : "hover:bg-gray-100"
      }">
      ${page}
    </button>
  `;
}

function ellipsis() {
  return `<span class="px-2 text-gray-400">...</span>`;
}

function goToPage(page) {
  CURRENT_PAGE = page;
  renderKerjasamaTable();
}

/* ===============================
   MODAL
=============================== */
async function openKerjasamaForm() {
  editIndex.value = "";
  document.getElementById("modal-title").textContent = "Tambah Kerjasama";

  // reset semua input, textarea, dan select
  document
    .querySelectorAll(
      "#kerjasama-form input, #kerjasama-form textarea, #kerjasama-form select",
    )
    .forEach((el) => (el.value = ""));

  setFormReadonly(false);

  document.getElementById("btn-edit").classList.add("hidden");
  document.getElementById("btn-save").classList.remove("hidden");

  // 🔥 pastikan dropdown siap SEBELUM modal tampil
  loadBenuaDropdown(); // Benua (sinkron)
  await loadCountryDropdown(true); // Negara (async + force reload)

  document.getElementById("kerjasama-modal").classList.remove("hidden");
}

function closeKerjasamaForm() {
  document.getElementById("kerjasama-modal").classList.add("hidden");
  editIndex.value = "";
  document
    .querySelectorAll("#kerjasama-modal input, #kerjasama-modal textarea")
    .forEach((el) => (el.value = ""));
}
// panggil ini dari openKerjasamaForm() dan dari openDetailKerjasama()
async function loadCountryDropdown(force = false) {
  const select = document.getElementById("negara");
  if (!select) return;

  // kalau sudah terisi (lebih dari 1 option), skip kecuali paksa
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

  // fallback option: pakai list statis (reliable)
  const renderOptions = (list) => {
    select.innerHTML = `<option value="">-- Pilih Negara --</option>`;
    list
      .sort((a, b) => a.localeCompare(b))
      .forEach((name) => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
      });
    console.log(
      "Country dropdown populated, count:",
      select.options.length - 1,
    );
  };

  // coba fetch API, kalau gagal pakai COUNTRY_LIST
  try {
    const res = await fetch("https://restcountries.com/v3.1/all?fields=name");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const countries = data.map((c) => c.name.common);
    renderOptions(countries);
  } catch (err) {
    console.warn("Gagal load countries API, pakai fallback list", err);
    renderOptions(COUNTRY_LIST);
  }
}
function loadBenuaDropdown() {
  const select = document.getElementById("benua");
  if (!select) return;

  const BENUA_LIST = [
    // ASIA
    "Asia Tenggara",
    "Asia Timur",
    "Asia Selatan",
    "Asia Tengah",
    "Asia Barat (Timur Tengah)",

    // EROPA
    "Eropa Barat",
    "Eropa Timur",
    "Eropa Utara",
    "Eropa Selatan",

    // AMERIKA
    "Amerika Utara",
    "Amerika Tengah",
    "Amerika Selatan",
    "Karibia",

    // AFRIKA
    "Afrika Utara",
    "Afrika Barat",
    "Afrika Tengah",
    "Afrika Timur",
    "Afrika Selatan",

    // OSEANIA
    "Australia & Selandia Baru",
    "Melanesia",
    "Mikronesia",
    "Polinesia",
  ];

  select.innerHTML = `<option value="">-- Pilih Benua --</option>`;

  BENUA_LIST.forEach((benua) => {
    const opt = document.createElement("option");
    opt.value = benua;
    opt.textContent = benua;
    select.appendChild(opt);
  });

  console.log("Dropdown benua siap:", BENUA_LIST.length);
}

/* ===============================
   SAVE (CREATE & UPDATE)
=============================== */
async function saveKerjasama() {
  const isCreate = editIndex.value === "" || editIndex.value === null;
  const payload = {
    action: isCreate ? "create" : "update",
    sheet: "INPUT KERJASAMA",
    row: isCreate ? undefined : Number(editIndex.value),
    data: {
      mitra: mitra.value,
      benua: benua.value,
      negara: negara.value,
      mitraTerkait: mitraTerkait.value,
      linkFile: linkFile.value,
      unit: unit.value,
      noSurat: noSurat.value,
      jenisMitra: jenisMitra.value,
      jenisDokumen: jenisDokumen.value,
      tingkat: tingkat.value,
      status: status.value,
      tglMulai: tglMulai.value,
      tglBerakhir: tglBerakhir.value,
      tahunMulai: tahunMulai.value,
      tahunBerakhir: tahunBerakhir.value,
      keterangan: keterangan.value,
    },
  };

  try {
    console.log("Saving payload:", payload);

    await fetch(API.kerjasama, {
      method: "POST",
      mode: "no-cors", // 🔥 KUNCI CORS
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // ⚠️ tidak boleh res.json() karena opaque response
    // anggap sukses, lalu sinkron ulang dari sheet

    await loadKerjasamaFromSheet();
    closeKerjasamaForm();
  } catch (err) {
    console.error("saveKerjasama error:", err);
    alert("Gagal menyimpan data (koneksi): " + err.message);
  }
}

/* ================================
   BAGIAN DETAIL
================================== */

function setFormReadonly(isReadonly) {
  document
    .querySelectorAll("#kerjasama-form input, #kerjasama-form textarea")
    .forEach((el) => {
      el.readOnly = isReadonly;
      el.disabled = isReadonly && el.type === "date";
    });
}
async function openDetailKerjasama(sheetRow) {
  await loadCountryDropdown(true);

  // temukan data berdasarkan row
  const idx = KERJASAMA.findIndex((x) => Number(x.row) === Number(sheetRow));
  if (idx === -1) return alert("Data tidak ditemukan (row " + sheetRow + ")");

  const d = KERJASAMA[idx];
  // simpan sheet row (bukan array index)
  editIndex.value = d.row;

  Object.keys(d).forEach((k) => {
    if (document.getElementById(k)) {
      document.getElementById(k).value = d[k];
    }
  });

  document.getElementById("modal-title").textContent = "Detail Kerjasama";
  setFormReadonly(true);
  document.getElementById("btn-edit").classList.remove("hidden");
  document.getElementById("btn-save").classList.add("hidden");
  document.getElementById("kerjasama-modal").classList.remove("hidden");
}

function switchToEdit() {
  document.getElementById("modal-title").textContent = "Edit Kerjasama";
  setFormReadonly(false);

  document.getElementById("btn-edit").classList.add("hidden");
  document.getElementById("btn-save").classList.remove("hidden");
}

/* ===============================
   EDIT
=============================== */
function editKerjasama(i) {
  const d = KERJASAMA[i];
  editIndex.value = i;

  mitra.value = d.mitra;
  benua.value = d.benua;
  negara.value = d.negara;
  mitraTerkait.value = d.mitraTerkait;
  linkFile.value = d.linkFile;
  unit.value = d.unit;
  noSurat.value = d.noSurat;
  jenisMitra.value = d.jenisMitra;
  jenisDokumen.value = d.jenisDokumen;
  tingkat.value = d.tingkat;
  status.value = d.status;
  tglMulai.value = d.tglMulai;
  tglBerakhir.value = d.tglBerakhir;
  tahunMulai.value = d.tahunMulai;
  tahunBerakhir.value = d.tahunBerakhir;
  keterangan.value = d.keterangan;

  openKerjasamaForm();
}

/* ===============================
   DELETE
=============================== */
async function deleteKerjasama(sheetRow) {
  if (!confirm("Hapus data kerjasama ini?")) return;

  try {
    await fetch(API.kerjasama, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete",
        sheet: "INPUT KERJASAMA",
        row: Number(sheetRow),
      }),
    });

    // JANGAN res.json()
    await loadKerjasamaFromSheet();
  } catch (err) {
    console.error("Delete error:", err);
    alert("Gagal menghapus data: " + err.message);
  }
}

function bindKerjasamaForm() {
  // buat global supaya dipakai fungsi lain (edit/save/close)
  window.editIndex = document.getElementById("editIndex");
  window.mitra = document.getElementById("mitra");
  window.benua = document.getElementById("benua");
  window.negara = document.getElementById("negara");
  window.mitraTerkait = document.getElementById("mitraTerkait");
  window.linkFile = document.getElementById("linkFile");
  window.unit = document.getElementById("unit");
  window.noSurat = document.getElementById("noSurat");
  window.jenisMitra = document.getElementById("jenisMitra");
  window.jenisDokumen = document.getElementById("jenisDokumen");
  window.tingkat = document.getElementById("tingkat");
  window.status = document.getElementById("status");
  window.tglMulai = document.getElementById("tglMulai");
  window.tglBerakhir = document.getElementById("tglBerakhir");
  window.tahunMulai = document.getElementById("tahunMulai");
  window.tahunBerakhir = document.getElementById("tahunBerakhir");
  window.keterangan = document.getElementById("keterangan");
}
