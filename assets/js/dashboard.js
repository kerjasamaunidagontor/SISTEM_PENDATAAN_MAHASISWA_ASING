/* ==============================
   LOAD PAGE (SPA)
============================== */
function loadPage(page) {
  fetch(`pages/${page}.html`)
    .then((res) => {
      if (!res.ok) throw new Error("Page not found");
      return res.text();
    })
    .then((html) => {
      document.getElementById("app-content").innerHTML = html;
      document.getElementById("page-title").textContent =
        page.charAt(0).toUpperCase() + page.slice(1);

      setActiveMenu(page);
      // beri waktu event loop supaya elemen DOM tersedia, lalu jalankan hook
      setTimeout(() => runPageScript(page), 0);
    })

    .catch((err) => {
      document.getElementById(
        "app-content"
      ).innerHTML = `<p class="text-red-500">Gagal memuat halaman</p>`;
      console.error(err);
    });
}

/* ==============================
   ACTIVE SIDEBAR
============================== */

/*================ Menu HUMBERGER ===============*/

function toggleSidebar(forceClose = false) {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  const isOpen = !sidebar.classList.contains("-translate-x-full");

  if (forceClose || isOpen) {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
  } else {
    sidebar.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
  }
}

function setActiveMenu(page) {
  document.querySelectorAll(".menu-link").forEach((link) => {
    link.classList.remove("bg-white/10");
    if (link.dataset.page === page) {
      link.classList.add("bg-white/10");
    }
  });
}

/* ==============================
   DASHBOARD (stats + charts)
============================== */
const APP = {
  stats: { ia: 0, mou: 0, moa: 0 },
};

let statusChart, growthChart;

function animateCounter(el, value) {
  if (!el) return;
  let n = 0;
  const step = Math.ceil(value / 40) || 1;
  const t = setInterval(() => {
    n += step;
    if (n >= value) {
      el.textContent = value;
      clearInterval(t);
    } else {
      el.textContent = n;
    }
  }, 20);
}

async function loadDashboardStats() {
  try {
    const res = await fetch(API.kerjasama);
    const data = await res.json();

    const stats = { ia: 0, mou: 0, moa: 0 };
    let aktif = 0;
    let tidakAktif = 0;
    const growth = {}; // { tahun: jumlah }

    data.forEach((d) => {
      const jenis = (d.jenisDokumen || "").toLowerCase();
      const ket = (d.keterangan || "").toLowerCase();
      const tahun = (d.tahunMulai || "").toString().trim();

      // ===== STAT BOX =====
      if (jenis.includes("implementation")) stats.ia++;
      else if (jenis.includes("understanding")) stats.mou++;
      else if (jenis.includes("agreement")) stats.moa++;

      // ===== STATUS PIE =====
      if (ket.includes("tidak")) {
        tidakAktif++;
      } else if (ket.includes("aktif")) {
        aktif++;
      }

      // ===== GROWTH LINE =====
      if (tahun) {
        growth[tahun] = (growth[tahun] || 0) + 1;
      }
    });

    // update stat boxes with animation (safely get elements)
    const elIa = document.getElementById("stat-ia");
    const elMou = document.getElementById("stat-mou");
    const elMoa = document.getElementById("stat-moa");

    animateCounter(elIa, stats.ia);
    animateCounter(elMou, stats.mou);
    animateCounter(elMoa, stats.moa);

    // render charts (will safely no-op if canvas not present)
    renderStatusChart(aktif, tidakAktif);
    renderGrowthChart(growth);
  } catch (err) {
    console.error("Dashboard stats error:", err);
  }
}

/* ============================================================
   PIE CHART
   Status Kerjasama (Aktif vs Tidak Aktif)
   Requires: <canvas id="statusChart"></canvas>
============================================================ */
function renderStatusChart(aktif = 0, tidakAktif = 0) {
  const canvas = document.getElementById("statusChart");
  if (!canvas) return;

  if (statusChart) statusChart.destroy();

  statusChart = new Chart(canvas, {
    type: "pie",
    data: {
      labels: ["Aktif", "Tidak Aktif"],
      datasets: [
        {
          data: [aktif, tidakAktif],
          backgroundColor: ["#22c55e", "#ef4444"],
          borderWidth: 1,
          borderColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 14,
            padding: 10,
            font: {
              size: 12,
              family: "Inter, sans-serif",
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.raw}`,
          },
        },
      },
    },
  });
}

/* ============================================================
   LINE CHART
   Pertumbuhan Kerjasama per Tahun
   Requires: <canvas id="growthChart"></canvas>
============================================================ */
function renderGrowthChart(growth = {}) {
  const canvas = document.getElementById("growthChart");
  if (!canvas) return;

  const years = Object.keys(growth).sort((a, b) => a - b);
  const values = years.map((year) => growth[year] ?? 0);

  if (growthChart) growthChart.destroy();

  growthChart = new Chart(canvas, {
    type: "line",
    data: {
      labels: years,
      datasets: [
        {
          label: "Jumlah Kerjasama",
          data: values,
          borderColor: "#6366f1",
          backgroundColor: "rgba(99,102,241,0.12)",
          borderWidth: 2,
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#6366f1",
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { left: 8, right: 50, top: 4, bottom: 0 },
      },
      scales: {
        x: {
          offset: true,
          grid: { display: false },
          ticks: {
            autoSkip: true,
            maxRotation: 0,
            font: { size: 11 },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0,0,0,0.05)",
          },
          ticks: {
            font: { size: 11 },
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
    },
  });
}
