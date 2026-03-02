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
   🌍 COUNTRY DISTRIBUTION MAP (FINAL CLEAN)
===================================================== */

function initCountryChart() {
  const container = document.getElementById("countryMap");
  if (!container) return;

  if (typeof jsVectorMap === "undefined") {
    console.error("jsVectorMap belum ter-load!");
    return;
  }

  if (window.countryMapInstance) {
    window.countryMapInstance.destroy();
  }

  // 🔥 HITUNG DISTRIBUSI LANGSUNG
  const counts = {};

  students.forEach((student) => {
    if (!student.negara) return;
    counts[student.negara] =
      (counts[student.negara] || 0) + 1;
  });

  // 🔥 FULL ISO MAP (195 Negara)
  const countryISOMap = {
    "Afghanistan": "AF",
    "Albania": "AL",
    "Algeria": "DZ",
    "Andorra": "AD",
    "Angola": "AO",
    "Antigua and Barbuda": "AG",
    "Argentina": "AR",
    "Armenia": "AM",
    "Australia": "AU",
    "Austria": "AT",
    "Azerbaijan": "AZ",
    "Bahamas": "BS",
    "Bahrain": "BH",
    "Bangladesh": "BD",
    "Barbados": "BB",
    "Belarus": "BY",
    "Belgium": "BE",
    "Belize": "BZ",
    "Benin": "BJ",
    "Bhutan": "BT",
    "Bolivia": "BO",
    "Bosnia and Herzegovina": "BA",
    "Botswana": "BW",
    "Brazil": "BR",
    "Brunei Darussalam": "BN",
    "Bulgaria": "BG",
    "Burkina Faso": "BF",
    "Burundi": "BI",
    "Cabo Verde": "CV",
    "Cambodia": "KH",
    "Cameroon": "CM",
    "Canada": "CA",
    "Central African Republic": "CF",
    "Chad": "TD",
    "Chile": "CL",
    "China": "CN",
    "Colombia": "CO",
    "Comoros": "KM",
    "Congo": "CG",
    "Costa Rica": "CR",
    "Côte d’Ivoire": "CI",
    "Croatia": "HR",
    "Cuba": "CU",
    "Cyprus": "CY",
    "Czech Republic": "CZ",
    "Democratic Republic of the Congo": "CD",
    "Denmark": "DK",
    "Djibouti": "DJ",
    "Dominica": "DM",
    "Dominican Republic": "DO",
    "Ecuador": "EC",
    "Egypt": "EG",
    "El Salvador": "SV",
    "Equatorial Guinea": "GQ",
    "Eritrea": "ER",
    "Estonia": "EE",
    "Eswatini": "SZ",
    "Ethiopia": "ET",
    "Fiji": "FJ",
    "Finland": "FI",
    "France": "FR",
    "Gabon": "GA",
    "Gambia": "GM",
    "Georgia": "GE",
    "Germany": "DE",
    "Ghana": "GH",
    "Greece": "GR",
    "Grenada": "GD",
    "Guatemala": "GT",
    "Guinea": "GN",
    "Guinea-Bissau": "GW",
    "Guyana": "GY",
    "Haiti": "HT",
    "Holy See": "VA",
    "Honduras": "HN",
    "Hungary": "HU",
    "Iceland": "IS",
    "India": "IN",
    "Indonesia": "ID",
    "Iran": "IR",
    "Iraq": "IQ",
    "Ireland": "IE",
    "Israel": "IL",
    "Italy": "IT",
    "Jamaica": "JM",
    "Japan": "JP",
    "Jordan": "JO",
    "Kazakhstan": "KZ",
    "Kenya": "KE",
    "Kiribati": "KI",
    "Kuwait": "KW",
    "Kyrgyzstan": "KG",
    "Laos": "LA",
    "Latvia": "LV",
    "Lebanon": "LB",
    "Lesotho": "LS",
    "Liberia": "LR",
    "Libya": "LY",
    "Liechtenstein": "LI",
    "Lithuania": "LT",
    "Luxembourg": "LU",
    "Madagascar": "MG",
    "Malawi": "MW",
    "Malaysia": "MY",
    "Maldives": "MV",
    "Mali": "ML",
    "Malta": "MT",
    "Marshall Islands": "MH",
    "Mauritania": "MR",
    "Mauritius": "MU",
    "Mexico": "MX",
    "Micronesia": "FM",
    "Moldova": "MD",
    "Monaco": "MC",
    "Mongolia": "MN",
    "Montenegro": "ME",
    "Morocco": "MA",
    "Mozambique": "MZ",
    "Myanmar": "MM",
    "Namibia": "NA",
    "Nauru": "NR",
    "Nepal": "NP",
    "Netherlands": "NL",
    "New Zealand": "NZ",
    "Nicaragua": "NI",
    "Niger": "NE",
    "Nigeria": "NG",
    "North Korea": "KP",
    "North Macedonia": "MK",
    "Norway": "NO",
    "Oman": "OM",
    "Pakistan": "PK",
    "Palau": "PW",
    "Palestine": "PS",
    "Panama": "PA",
    "Papua New Guinea": "PG",
    "Paraguay": "PY",
    "Peru": "PE",
    "Philippines": "PH",
    "Poland": "PL",
    "Portugal": "PT",
    "Qatar": "QA",
    "Romania": "RO",
    "Russia": "RU",
    "Rwanda": "RW",
    "Saint Kitts and Nevis": "KN",
    "Saint Lucia": "LC",
    "Saint Vincent and the Grenadines": "VC",
    "Samoa": "WS",
    "San Marino": "SM",
    "Sao Tome and Principe": "ST",
    "Saudi Arabia": "SA",
    "Senegal": "SN",
    "Serbia": "RS",
    "Seychelles": "SC",
    "Sierra Leone": "SL",
    "Singapore": "SG",
    "Slovakia": "SK",
    "Slovenia": "SI",
    "Solomon Islands": "SB",
    "Somalia": "SO",
    "South Africa": "ZA",
    "South Korea": "KR",
    "South Sudan": "SS",
    "Spain": "ES",
    "Sri Lanka": "LK",
    "Sudan": "SD",
    "Suriname": "SR",
    "Sweden": "SE",
    "Switzerland": "CH",
    "Syria": "SY",
    "Tajikistan": "TJ",
    "Tanzania": "TZ",
    "Thailand": "TH",
    "Timor-Leste": "TL",
    "Togo": "TG",
    "Tonga": "TO",
    "Trinidad and Tobago": "TT",
    "Tunisia": "TN",
    "Turkey": "TR",
    "Turkmenistan": "TM",
    "Tuvalu": "TV",
    "Uganda": "UG",
    "Ukraine": "UA",
    "United Arab Emirates": "AE",
    "United Kingdom": "GB",
    "United States": "US",
    "Uruguay": "UY",
    "Uzbekistan": "UZ",
    "Vanuatu": "VU",
    "Venezuela": "VE",
    "Vietnam": "VN",
    "Yemen": "YE",
    "Zambia": "ZM",
    "Zimbabwe": "ZW"
  };

  // 🔥 BALIKKAN ISO → COUNTRY NAME
  const isoToCountryMap = Object.fromEntries(
    Object.entries(countryISOMap).map(([name, iso]) => [iso, name])
  );

  const mapData = {};

  Object.keys(counts).forEach((country) => {
    const iso = countryISOMap[country];
    if (iso) {
      mapData[iso] = counts[country];
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
  const totalStudents = students.length;

  const percent = totalStudents
    ? ((value / totalStudents) * 100).toFixed(1)
    : 0;

  const countryName =
    isoToCountryMap[code] || tooltip.textContent;

  // 🔥 Buat bar teks (max 10 blok)
  const barLength = 10;
  const filledBlocks = Math.round((percent / 100) * barLength);
  const emptyBlocks = barLength - filledBlocks;

  const progressBar =
    "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);

  tooltip.innerHTML = `
    <div style="font-family:monospace;padding:6px;line-height:1.5;">
      🌍 ${countryName}<br>
      👨‍🎓 ${value} Mahasiswa<br>
      ${progressBar}<br>
      ${percent}% dari total
    </div>
  `;
}
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