const fileInput = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const fileCard = document.getElementById("fileCard");
const fileName = document.getElementById("fileName");
const fileMeta = document.getElementById("fileMeta");
const removeBtn = document.getElementById("removeBtn");
const separateBtn = document.getElementById("separateBtn");
const model = document.getElementById("model");
const progressWrap = document.getElementById("progressWrap");
const progressBar = document.getElementById("progressBar");
const progressPct = document.getElementById("progressPct");
const progressLabel = document.getElementById("progressLabel");
const results = document.getElementById("results");
const stemGrid = document.getElementById("stemGrid");
const downloadAllBtn = document.getElementById("downloadAllBtn");

let selectedFile = null;
let generatedUrls = [];

document.getElementById("year").textContent = new Date().getFullYear();

fileInput.addEventListener("change", e => setFile(e.target.files[0]));
["dragenter", "dragover"].forEach(evt => dropzone.addEventListener(evt, e => {
  e.preventDefault(); dropzone.classList.add("drag");
}));
["dragleave", "drop"].forEach(evt => dropzone.addEventListener(evt, e => {
  e.preventDefault(); dropzone.classList.remove("drag");
}));
dropzone.addEventListener("drop", e => setFile(e.dataTransfer.files[0]));

function setFile(file) {
  if (!file || !file.type.startsWith("audio/")) return;
  selectedFile = file;
  fileName.textContent = file.name;
  fileMeta.textContent = `${formatBytes(file.size)} • Ready to process`;
  fileCard.classList.remove("hidden");
  separateBtn.disabled = false;
  results.classList.add("hidden");
  progressWrap.classList.add("hidden");
}

removeBtn.addEventListener("click", () => {
  selectedFile = null;
  fileInput.value = "";
  fileCard.classList.add("hidden");
  separateBtn.disabled = true;
  results.classList.add("hidden");
  cleanupUrls();
});

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B","KB","MB","GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}

separateBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  progressWrap.classList.remove("hidden");
  results.classList.add("hidden");
  separateBtn.disabled = true;

  // Frontend demo mode. Replace this block with a fetch() call to your
  // backend endpoint, e.g. POST /api/separate with FormData("file", selectedFile).
  for (let pct = 0; pct <= 100; pct += 5) {
    await new Promise(r => setTimeout(r, 90));
    progressBar.style.width = pct + "%";
    progressPct.textContent = pct + "%";
    progressLabel.textContent = pct < 100 ? "Separating stems…" : "Complete";
  }

  buildDemoResults();
  separateBtn.disabled = false;
});

function buildDemoResults() {
  cleanupUrls();
  const two = model.value === "2stems";
  const stems = two
    ? [["Vocals", "Lead & backing vocals"], ["Instrumental", "Music without vocals"]]
    : [["Vocals", "Lead & backing vocals"], ["Drums", "Percussion"], ["Bass", "Low-frequency instruments"], ["Other", "Remaining instruments"]];

  stemGrid.innerHTML = "";
  stems.forEach(([name, desc]) => {
    const url = URL.createObjectURL(selectedFile);
    generatedUrls.push(url);
    const card = document.createElement("article");
    card.className = "stem";
    card.innerHTML = `
      <div class="stem-top">
        <div><div class="stem-name">${name}</div><div class="stem-type">${desc}</div></div>
        <span>WAV</span>
      </div>
      <audio controls src="${url}"></audio>
      <a href="${url}" download="${safeName(selectedFile.name)}-${name.toLowerCase()}.wav">Download ${name}</a>
    `;
    stemGrid.appendChild(card);
  });
  results.classList.remove("hidden");
}

function safeName(name) {
  return name.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9_-]/gi, "_");
}

function cleanupUrls() {
  generatedUrls.forEach(u => URL.revokeObjectURL(u));
  generatedUrls = [];
}

downloadAllBtn.addEventListener("click", () => {
  stemGrid.querySelectorAll("a").forEach((a, i) => {
    setTimeout(() => a.click(), i * 150);
  });
});
