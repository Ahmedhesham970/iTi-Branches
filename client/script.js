document.addEventListener("DOMContentLoaded", async function () {
  const page = window.location.pathname.split("/").pop();

  if (page === "index.html") setupBaseMap();
  else if (page === "wfs.html") initWFSPage();
  else if (page === "wms.html") initWMSPage();
  else if (page === "full.html") initFullPage();
});

function setupBaseMap() {
  const map = L.map("map").setView([26.8206, 30.8025], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  addMessage(map);

  // await loadBranches(map);
  enableAddBranch(map);
  return map;
}

function initWFSPage() {
  const map = setupBaseMap();
  addMessage(map);
  enableAddBranch(map);

  const wfsUrl =
    "http://localhost:8085/geoserver/ITI-BRANCHES/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ITI-BRANCHES%3AiTi%20Branches&outputFormat=application%2Fjson&maxFeatures=50";

  fetch(wfsUrl)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch WFS");
      return res.json();
    })
    .then((geojson) => {
      const layer = L.geoJSON(geojson, {
        onEachFeature: (feature, layer) => {
          const name = feature.properties?.Branch || "Unknown Branch";
          const tracks = feature.properties?.Tracks || "No data";
          const lon = feature.properties?.X;
          const lat = feature.properties?.Y;

          layer.bindPopup(`
            <div>
              <h3>${name}</h3>
              <p><strong>Tracks:</strong> ${tracks}</p>
              <p><strong>Lat:</strong> ${lat}</p>
              <p><strong>Lon:</strong> ${lon}</p>
            </div>
          `);
        },
        pointToLayer: (feature, latlng) =>
          L.circleMarker(latlng, {
            radius: 6,
            fillColor: "red",
            color: "white",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          }),
      }).addTo(map);

      // const bounds = layer.getBounds();
      // if (bounds.isValid && bounds.isValid()) map.fitBounds(bounds);
    })
    .catch((err) => console.error("❌ WFS Error:", err));
}

function initWMSPage() {
  const map = setupBaseMap();
  addMessage(map);
  enableAddBranch(map);

  L.tileLayer
    .wms("http://localhost:8085/geoserver/ITI-BRANCHES/wms", {
      layers: "ITI-BRANCHES:iTi Branches",
      format: "image/png",
      transparent: true,
      version: "1.1.0",
      attribution: "ITI Branches",
    })
    .addTo(map);
}

function initFullPage() {
  const map = setupBaseMap();
  addMessage(map);
  enableAddBranch(map);
  loadBranches(map);
}

function addMessage(map) {
  const messageControl = L.control({ position: "topright" });
  messageControl.onAdd = function () {
    const div = L.DomUtil.create("div", "map-message");
    div.innerHTML = `
      <h2>🌍 ITI Branches Map</h2>
      <h1>قريبًا بإذن الله الفرع القادم في فلسطين</h1>
      <img src="./public/6307_j2ym_231116.jpg" alt="Coming Soon  " width="100">
    `;
    return div;
  };
  messageControl.addTo(map);
}

async function loadBranches(map) {
  try {
    const res = await fetch("http://localhost:2711/api/v1/branches");
    const data = await res.json();
    const branches = data?.data || [];

    const markers = [];

    branches.forEach((branch) => {
      const { X: lon, Y: lat, Branch: name, Tracks: tracks } = branch;
      if (!lat || !lon) return;

      const customIcon = L.icon({
        iconUrl: "./public/marker.png",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        shadowAnchor: [4, 62],
        shadowSize: [50, 64],

        popupAnchor: [0, -35],
      });

      const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
      const imagePath = `./public/branches/${name}.png`;
      fetch(imagePath).then((imgRes) => {
        const imageTag = imgRes.ok
          ? `<img src="${imagePath}" alt="${name}">`
          : "";
        const popupContent = `
          <div class="popup-card">
            ${imageTag}
            <div class="popup-info">
              <h3>${name}</h3>
              <p><strong>Tracks:</strong> ${tracks || "N/A"}</p>
              <p><strong>Latitude:</strong> ${lat}</p>
              <p><strong>Longitude:</strong> ${lon}</p>
            </div>
          </div>`;
        marker.bindPopup(popupContent);
      });

      markers.push([lat, lon]);
    });

    if (markers.length > 0)
      map.fitBounds(L.latLngBounds(markers), { padding: [50, 50] });
  } catch (err) {
    console.error("❌ Error loading branches:", err);
  }
}

function enableAddBranch(map) {
  let marker;
  map.on("click", function (e) {
    const { lat, lng } = e.latlng;
    document.getElementById("lat").value = lat.toFixed(6);
    document.getElementById("lon").value = lng.toFixed(6);

    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map);
  });

  const form = document.getElementById("branch-form");
  if (!form) return;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const branchData = {
      Branch: document.getElementById("name").value,
      X: parseFloat(document.getElementById("lon").value),
      Y: parseFloat(document.getElementById("lat").value),
      Tracks: document.getElementById("tracks").value,
    };

    try {
      const res = await fetch("http://localhost:2711/api/v1/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branchData),
      });

      if (!res.ok) throw new Error("Failed to add branch");

      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Your work has been saved",
        showConfirmButton: true,
      });

      await loadBranches(map);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `An error occured ,${err.message}!`,
        text: "check your inputs and try again.",
      });
    }
  });
}
