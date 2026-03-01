/**
 * dashboard.js - Dashboard page logic
 */

async function initDashboard() {

  if (!students || students.length === 0) {
    await loadStudentsFromAPI();
  }

  if (!mobilityPrograms || mobilityPrograms.length === 0) {
    await loadMobilityFromAPI();
  }

  await loadAdmissionsFromServer();

  const stats = {
    totalStudents: getTotalStudents(),
    totalCountries: new Set(students.map((s) => s.negara)).size,
    activeMobility: getTotalActiveMobility(),
    newAdmissions: admissions.length,
  };

  const totalStudentsEl = document.getElementById("totalStudents");
  if (totalStudentsEl) totalStudentsEl.textContent = stats.totalStudents;

  const totalCountriesEl = document.getElementById("totalCountries");
  if (totalCountriesEl) totalCountriesEl.textContent = stats.totalCountries;

  const activeMobilityEl = document.getElementById("activeMobility");
  if (activeMobilityEl) activeMobilityEl.textContent = stats.activeMobility;

  const newAdmissionsEl = document.getElementById("newAdmissions");
if (newAdmissionsEl) newAdmissionsEl.textContent = stats.newAdmissions;

  initCountryChart();
  initTrendChart();
  loadRecentActivity();
}

/* =====================================================
   🔥 DISTRIBUSI NEGARA (DINAMIS DARI DATA STUDENTS)
===================================================== */
function getCountryDistribution(data) {
  const countryCount = {};

  data.forEach((student) => {
    const country = student.negara || "Tidak diketahui";

    if (countryCount[country]) {
      countryCount[country]++;
    } else {
      countryCount[country] = 1;
    }
  });

  return {
    labels: Object.keys(countryCount),
    values: Object.values(countryCount),
  };
}

/* =====================================================
   🌍 COUNTRY DISTRIBUTION MAP
===================================================== */

function initCountryChart() {
  const container = document.getElementById("countryMap");
  if (!container) return;

  // 🔥 CEK apakah library sudah load
  if (typeof jsVectorMap === "undefined") {
    console.error("jsVectorMap belum ter-load!");
    return;
  }

  if (window.countryMapInstance) {
    window.countryMapInstance.destroy();
  }

  const distribution = getCountryDistribution(students);

  const countryISOMap = {
    Malaysia: "MY",
    Thailand: "TH",
    Indonesia: "ID",
    Yaman: "YE",
    Palestina: "PS",
    Korea: "KR",
    Jepang: "JP",
    China: "CN",
  };

  const mapData = {};

  distribution.labels.forEach((country, index) => {
    const iso = countryISOMap[country];
    if (iso) {
      mapData[iso] = distribution.values[index];
    }
  });

  window.countryMapInstance = new jsVectorMap({
    selector: "#countryMap",
    map: "world",
    zoomButtons: true,
    regionStyle: {
      initial: { fill: "#E5E7EB" },
      hover: { fill: "#3B82F6" },
    },
    series: {
      regions: [
        {
          values: mapData,
          scale: ["#93C5FD", "#1D4ED8"],
          normalizeFunction: "polynomial",
        },
      ],
    },
    onRegionTooltipShow(event, tooltip, code) {
      const value = mapData[code] || 0;
      const countryName = tooltip.textContent;

      const totalStudents = students.length;
      const percent = totalStudents
        ? ((value / totalStudents) * 100).toFixed(1)
        : 0;

      let content = `
    <div style="
      font-family: Inter, sans-serif;
      padding: 8px;
      min-width: 160px;
    ">
      <div style="
        font-weight: 600;
        font-size: 13px;
        margin-bottom: 6px;
      ">
        🌍 ${countryName}
      </div>
  `;

      if (value > 0) {
        content += `
      <div style="
        font-size: 12px;
        margin-bottom: 4px;
      ">
        👨‍🎓 <strong>${value}</strong> Mahasiswa
      </div>

      <div style="
        background: #e5e7eb;
        height: 6px;
        border-radius: 999px;
        overflow: hidden;
      ">
        <div style="
          width: ${percent}%;
          background: #3b82f6;
          height: 100%;
        "></div>
      </div>

      <div style="
        font-size: 11px;
        color: #6b7280;
        margin-top: 4px;
      ">
        ${percent}% dari total
      </div>
    `;
      } else {
        content += `
      <div style="
        font-size: 12px;
        color: #9ca3af;
      ">
        Belum ada mahasiswa
      </div>
    `;
      }

      content += `</div>`;

      tooltip.innerHTML = content;
    },
  });
}

/* =====================================================
   📈 TREND CHART (MASIH STATIC - BISA DINAMIS NANTI)
===================================================== */
function initTrendChart() {
  const ctx = document.getElementById("trendChart");
  if (!ctx) return;

  if (window.trendChartInstance) {
    window.trendChartInstance.destroy();
  }

  window.trendChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
      datasets: [
        {
          label: "Penerimaan Baru",
          data: [12, 19, 15, 22, 18, 25],
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#3B82F6",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

/* =====================================================
   📰 RECENT ACTIVITY
===================================================== */
function loadRecentActivity() {
  const activities = students
    .slice(-4)
    .reverse()
    .map((s) => ({
      time: "Baru saja",
      text: `📥 Pendaftaran baru: ${s.nama} (${s.negara})`,
      type: "new",
    }));

  const container = document.getElementById("recentActivity");
  if (!container) return;

  container.innerHTML = activities
    .map(
      (act) => `
      <div class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
        <div class="mt-1 text-lg">📥</div>
        <div>
          <p class="text-sm text-gray-700">${act.text}</p>
          <p class="text-xs text-gray-400">${act.time}</p>
        </div>
      </div>
    `,
    )
    .join("");
}
