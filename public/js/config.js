let apiKeys = JSON.parse(localStorage.getItem("apiKeys")) || [
  { name: "Key 1", value: "abc123-xyz" },
  { name: "Key 2", value: "def456-uvw" }
];

let selectedKey = null;
const listEl = document.getElementById("apikeyList");
const modal = document.getElementById("addModal");

function renderKeys() {
  listEl.innerHTML = "";
  apiKeys.forEach((key, index) => {
    const li = document.createElement("li");
    li.className = "apikey-item" + (selectedKey && selectedKey.value === key.value ? " active" : "");

    li.innerHTML = `
      <div class="apikey-info">
        <div class="apikey-name">${key.name}</div>
        <div class="apikey-value">${key.value}</div>
      </div>
      <button class="btn-delete">Hapus</button>
    `;

    // Pilih key
    li.querySelector(".apikey-info").addEventListener("click", () => {
      document.querySelectorAll(".apikey-item").forEach(el => el.classList.remove("active"));
      li.classList.add("active");
      selectedKey = key;
    });

    // Hapus key
    li.querySelector(".btn-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      apiKeys.splice(index, 1);
      if (selectedKey && selectedKey.value === key.value) {
        selectedKey = null;
      }
      saveKeys();
      renderKeys();
    });

    listEl.appendChild(li);
  });
}

function saveKeys() {
  localStorage.setItem("apiKeys", JSON.stringify(apiKeys));
}

// Buka modal
document.getElementById("openModalBtn").addEventListener("click", () => {
  modal.classList.add("show");
});

// Tutup modal
document.getElementById("closeModalBtn").addEventListener("click", () => {
  modal.classList.remove("show");
});

// Tambah key
document.getElementById("addBtn").addEventListener("click", () => {
  const name = document.getElementById("newName").value.trim();
  const value = document.getElementById("newValue").value.trim();

  if (!name || !value) {
    alert("Nama dan Value API Key wajib diisi!");
    return;
  }

  apiKeys.push({ name, value });
  saveKeys();
  renderKeys();

  document.getElementById("newName").value = "";
  document.getElementById("newValue").value = "";
  modal.classList.remove("show");
});

// Simpan pilihan
document.getElementById("saveBtn").addEventListener("click", () => {
  if (selectedKey) {
    localStorage.setItem("selectedApiKey", JSON.stringify(selectedKey));
    alert(`API Key tersimpan: ${selectedKey.name}`);
  } else {
    alert("Silakan pilih salah satu API Key dulu!");
  }
});

// Load pilihan terakhir
const lastKey = localStorage.getItem("selectedApiKey");
if (lastKey) {
  selectedKey = JSON.parse(lastKey);
}

renderKeys();
