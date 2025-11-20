const addBtn = document.getElementById("addBtn");
const broadcastList = document.getElementById("broadcastList");
const messageInput = document.getElementById("messageInput");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const emptyState = document.getElementById("emptyState");
const editArea = document.getElementById("editArea");

let currentItem = null;
// Memastikan pesan dimuat dari localStorage saat inisialisasi
let messages = JSON.parse(localStorage.getItem('broadcastMessages')) || []; 

// === ELEMEN MODAL TAMBAH PESAN BARU ===
const addModal = document.getElementById('addModal');
const titleInput = document.getElementById('titleInput');
const newMessageInput = document.getElementById('newMessageInput');
const modalCreateBtn = document.getElementById('modalCreateBtn');
const modalAddCancelBtn = document.getElementById('modalAddCancelBtn');
// ========================================

// === ELEMEN BARU UNTUK MULTI-KONTEN (CHIPS & FIELDS MODAL TAMBAH) ===
const contentChips = document.getElementById('contentChips');
const textFields = document.getElementById('textFields');
const imageFields = document.getElementById('imageFields');
const fileFields = document.getElementById('fileFields');

// DIGANTI: Menggunakan input URL
const imageUrlInput = document.getElementById('imageUrlInput'); 
const imageCaption = document.getElementById('imageCaption');
const fileUrlInput = document.getElementById('fileUrlInput'); 
const fileCaption = document.getElementById('fileCaption');
// ========================================

// === ELEMEN BARU UNTUK EDITOR UTAMA (#editArea) ===
const editFieldsText = document.getElementById('editFieldsText');

const editFieldsImage = document.getElementById('editFieldsImage');
const currentImageUrl = document.getElementById('currentImageUrl'); // DIGANTI
const editImageUrlInput = document.getElementById('editImageUrlInput'); // DIGANTI
const editImageCaption = document.getElementById('editImageCaption');

const editFieldsFile = document.getElementById('editFieldsFile');
const currentFileUrl = document.getElementById('currentFileUrl'); // DIGANTI
const editFileUrlInput = document.getElementById('editFileUrlInput'); // DIGANTI
const editFileCaption = document.getElementById('editFileCaption');
// =================================================

// Elemen Modal Kirim
const sendBtn = document.getElementById('sendBtn');
const sendModal = document.getElementById('sendModal');
const closeBtns = document.querySelectorAll('.close-btn'); 
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalSendBtn = document.getElementById('modalSendBtn');
const contactDropdown = document.getElementById('contact-dropdown');
const notification = document.getElementById('notification');
// === ELEMEN UNTUK MULTI-SELECT CHIP ===
const selectedContactsContainer = document.getElementById('selectedContactsContainer');
let selectedContacts = new Map(); // Map untuk menyimpan kontak terpilih (nomor -> {nama, nomor})

// === ELEMEN UNTUK PILIHAN KIRIM (API KEY & SCHEDULE INPUTS) ===
const apiKeySelect = document.getElementById("apiKeySelect");
const scheduleDateInput = document.getElementById("scheduleDateInput"); // Input Tanggal
const scheduleTimeInput = document.getElementById("scheduleTimeInput"); // Input Jam
const contactSearchInput = document.getElementById('contact-search'); // Input Pencarian

let availableApiKeys = [];
// ========================================


// === FUNGSI UTILITAS ===

function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification show ${type}`; 
    setTimeout(() => {
        notification.className = `notification hidden ${type}`;
    }, 3000);
}

function hideModal() {
    sendModal.style.display = 'none';
    addModal.style.display = 'none';
}

// Fungsi Reusable untuk menyimpan semua perubahan pada pesan aktif (Teks, API Key, Scheduling, Konten)
function saveCurrentMessageChanges(shouldResetEditor = false) {
    if (!currentItem) return;

    const id = parseInt(currentItem.getAttribute("data-id"));
    const msg = messages.find(m => m.id === id);
    
    if (!msg) return; 

    // --- LOGIKA PENYIMPANAN KONTEN BARU ---
    if (msg.contentType === 'text') {
        msg.text = messageInput.value;
        msg.content = { text: messageInput.value };
    } else if (msg.contentType === 'image') {
        // Jika ada URL baru yang diinput, simpan
        if (editImageUrlInput && editImageUrlInput.value.trim() !== '') {
            msg.content.url = editImageUrlInput.value.trim(); // Simpan URL
            // Simulasi nama file (dari URL)
            msg.content.file_name = msg.content.url.split('/').pop().split('?')[0];
            editImageUrlInput.value = ''; // Clear input setelah simpan
        }
        msg.content.caption = editImageCaption ? editImageCaption.value : '';
        msg.text = msg.content.caption; 
    } else if (msg.contentType === 'file') {
        if (editFileUrlInput && editFileUrlInput.value.trim() !== '') {
            msg.content.url = editFileUrlInput.value.trim(); // Simpan URL
            msg.content.file_name = msg.content.url.split('/').pop().split('?')[0];
            editFileUrlInput.value = ''; // Clear input setelah simpan
        }
        msg.content.caption = editFileCaption ? editFileCaption.value : '';
        msg.text = msg.content.caption;
    }
    // ------------------------------------
    
    // Logika Penentuan Mode Penjadwalan
    const selectedApiKeyValue = apiKeySelect ? apiKeySelect.value : '';
    const selectedApiKeyName = apiKeySelect ? apiKeySelect.options[apiKeySelect.selectedIndex].textContent : '';
    const dateValue = scheduleDateInput ? scheduleDateInput.value.trim() : ''; 
    const timeValue = scheduleTimeInput ? scheduleTimeInput.value.trim() : '';

    let scheduleMode = '';
    let scheduleValue = '';

    if (dateValue && timeValue) {
        scheduleMode = 'once';
        scheduleValue = `${dateValue}T${timeValue}`; 
    } else if (timeValue && !dateValue) {
        scheduleMode = 'daily';
        scheduleValue = timeValue;
    } else {
        scheduleMode = ''; 
        scheduleValue = '';
    }

    // 1. Simpan API Key
    if (selectedApiKeyValue !== '' && selectedApiKeyValue !== 'Tidak ada API Key tersedia') {
        msg.apiKey = { name: selectedApiKeyName, value: selectedApiKeyValue };
        localStorage.setItem("selectedApiKey", JSON.stringify(msg.apiKey));
    } else {
        msg.apiKey = null;
        localStorage.removeItem("selectedApiKey");
    }
    
    // 2. Simpan Penjadwalan
    msg.scheduleMode = scheduleMode;
    msg.scheduleValue = scheduleValue;
    localStorage.setItem("selectedScheduleMode", scheduleMode);
    localStorage.setItem("selectedScheduleValue", scheduleValue);

    saveMessages();
    renderMessages();
    
    showNotification("Pesan dan Pengaturan disimpan!", "success");
    
    if (shouldResetEditor) {
        resetEditor();
    } else {
        // Jika tidak reset, muat ulang tampilan editor saat ini
        const currentMsg = messages.find(m => m.id === id);
        if (currentMsg.contentType === 'image' && currentImageUrl) {
             currentImageUrl.textContent = currentMsg.content.url || 'Tidak ada URL';
             editImageUrlInput.value = currentMsg.content.url || '';
        } else if (currentMsg.contentType === 'file' && currentFileUrl) {
             currentFileUrl.textContent = currentMsg.content.url || 'Tidak ada URL';
             editFileUrlInput.value = currentMsg.content.url || '';
        }
    }
}

// FUNGSI: Mengelola saklar aktif/nonaktif pesan
function handleToggleActive(e) {
    e.stopPropagation(); 
    
    const checkbox = e.target;
    const li = checkbox.closest('li'); 
    const id = parseInt(li.getAttribute("data-id"));
    const msg = messages.find(m => m.id === id);
    
    if (msg) {
        msg.active = checkbox.checked;
        saveMessages();
        
        if (msg.active) {
            li.classList.remove('inactive');
            showNotification(`Pesan '${msg.title}' diaktifkan!`, 'success');
        } else {
            li.classList.add('inactive');
            showNotification(`Pesan '${msg.title}' dinonaktifkan!`, 'warning'); 
        }
        
        const label = checkbox.closest('label');
        if (label) {
            label.title = msg.active ? 'Nonaktifkan' : 'Aktifkan';
        }
    }
}

// FUNGSI: Memuat pengaturan API Key dan Waktu saat pesan dipilih
function loadMessageSettings(message) {
    const selectedKeyObject = message.apiKey || null;
    const storedSelectedKeyGlobal = localStorage.getItem("selectedApiKey");
    const globalDefaultKey = storedSelectedKeyGlobal ? JSON.parse(storedSelectedKeyGlobal) : null;
    const finalKey = message.id ? selectedKeyObject : (selectedKeyObject || globalDefaultKey);
    loadApiKeys(finalKey); 
    
    const storedScheduleModeGlobal = localStorage.getItem("selectedScheduleMode");
    const storedScheduleValueGlobal = localStorage.getItem("selectedScheduleValue");

    const finalMode = message.id ? (message.scheduleMode || '') : (message.scheduleMode || storedScheduleModeGlobal || '');
    const finalScheduleValue = message.id ? (message.scheduleValue || '') : (message.scheduleValue || storedScheduleValueGlobal || '');

    if (scheduleDateInput) scheduleDateInput.value = '';
    if (scheduleTimeInput) scheduleTimeInput.value = '';

    if (finalMode === 'daily') {
        if (scheduleTimeInput) {
            scheduleTimeInput.value = finalScheduleValue || ''; 
        }
    } else if (finalMode === 'once') { 
        if (finalScheduleValue && finalScheduleValue.includes('T')) {
            const [datePart, timePart] = finalScheduleValue.split('T');
            if (scheduleDateInput) {
                scheduleDateInput.value = datePart; 
            }
            if (scheduleTimeInput) {
                scheduleTimeInput.value = timePart; 
            }
        }
    } 
}

// FUNGSI: Memuat daftar API Key dari localStorage
function loadApiKeys(selectedKeyObject = null) {
    const storedKeys = localStorage.getItem("apiKeys");
    const defaultKeys = [
        { name: "Key 1 (Contoh)", value: "abc123-xyz" },
        { name: "Key 2 (Contoh)", value: "def456-uvw" }
    ];
    availableApiKeys = storedKeys ? JSON.parse(storedKeys) : defaultKeys; 
    populateApiKey(selectedKeyObject);
}

// FUNGSI: Mengisi dropdown API Key
function populateApiKey(selectedKeyObject = null) {
    if (!apiKeySelect) return;
    apiKeySelect.innerHTML = '';
    
    if (availableApiKeys.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Tidak ada API Key tersedia';
        apiKeySelect.appendChild(option);
        apiKeySelect.disabled = true;
        return;
    }

    let selectedKeyFound = false;

    availableApiKeys.forEach((key, index) => {
        const option = document.createElement('option');
        
        if (!key.value || !key.name) return;

        option.value = key.value; 
        option.textContent = `${key.name} (${key.value.substring(0, 4)}...)`;
        
        if (selectedKeyObject && selectedKeyObject.value === key.value) {
            option.selected = true;
            selectedKeyFound = true;
        } 
        
        if (index === 0 && !selectedKeyFound && !selectedKeyObject) {
            option.selected = true;
        }

        apiKeySelect.appendChild(option);
    });
    
    apiKeySelect.disabled = false;
}

// FUNGSI: Memuat pesan dari localStorage (Memasukkan properti 'recipients')
function loadMessages() {
    const saved = localStorage.getItem("broadcastMessages");
    
    messages = saved ? JSON.parse(saved) : [
        // Tambahkan properti 'contentType' dan 'content' (default text)
        { id: 1, title: "Promo Diskon Akhir Tahun", text: "Dapatkan diskon spesial...", apiKey: null, scheduleMode: 'daily', scheduleValue: '08:00', active: true, recipients: ["6281234567890", "6287654321098"], contentType: 'text', content: {text: "Dapatkan diskon spesial..."} },
        { id: 2, title: "Pengumuman Maintenance Server", text: "Mohon maaf atas ketidaknyamanan...", apiKey: null, scheduleMode: '', scheduleValue: '', active: true, recipients: [], contentType: 'text', content: {text: "Mohon maaf atas ketidaknyamanan..."} },
        { id: 3, title: "Ucapan Selamat Hari Raya", text: "Selamat Hari Raya Idul Fitri", apiKey: null, scheduleMode: 'once', scheduleValue: '2025-04-01T06:00', active: false, recipients: [], contentType: 'image', content: {url: "https://example.com/image.jpg", file_name: "image.jpg", caption: "Selamat Hari Raya Idul Fitri"} } 
    ];
    
    // Pastikan semua objek pesan memiliki properti 'recipients', 'contentType', dan 'content'
    messages.forEach(msg => {
        if (!msg.recipients) {
            msg.recipients = [];
        }
        // Backward compatibility
        if (!msg.contentType) {
            msg.contentType = 'text';
        }
        if (!msg.content) {
            msg.content = { text: msg.text || '' };
        }
    });

    renderMessages();
}

// FUNGSI: Menyimpan pesan ke localStorage
function saveMessages() {
    localStorage.setItem("broadcastMessages", JSON.stringify(messages));
}

// FUNGSI: Me-render daftar pesan
function renderMessages() {
    broadcastList.innerHTML = "";
    if (messages.length === 0) {
        broadcastList.innerHTML = '<li class="placeholder-list">Belum ada pesan tersimpan.</li>';
        resetEditor();
        return;
    }
    
    messages.forEach(msg => {
        const li = document.createElement("li");
        li.setAttribute("data-id", msg.id);
        
        if (msg.active === false) {
            li.classList.add("inactive");
        }

        let typeIcon = '';
        if (msg.contentType === 'image') {
            typeIcon = '🖼️';
        } else if (msg.contentType === 'file') {
            typeIcon = '📎';
        } else {
            typeIcon = '📝';
        }

        li.innerHTML = `
            <span class="text">${typeIcon} ${msg.title}</span> 
            <div class="controls">
                <label class="switch" title="${msg.active ? 'Nonaktifkan' : 'Aktifkan'} pesan">
                    <input type="checkbox" class="toggle-active" ${msg.active ? 'checked' : ''} data-id="${msg.id}">
                    <span class="slider round"></span>
                </label>
                <span class="delete" title="Hapus Pesan">🗑️</span>
            </div>
        `;

        attachItemEvents(li);
        
        const toggle = li.querySelector('.toggle-active');
        if (toggle) {
            toggle.addEventListener('click', handleToggleActive);
        }
        
        broadcastList.appendChild(li);
    });
}

// FUNGSI: Menempelkan event ke item daftar (klik untuk edit/hapus)
function attachItemEvents(item) {
    item.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete") || e.target.closest('.switch')) {
            if (e.target.classList.contains("delete")) {
                const id = parseInt(item.getAttribute("data-id"));
                messages = messages.filter(m => m.id !== id);
                saveMessages();
                renderMessages();
                resetEditor();
                showNotification("Pesan berhasil dihapus.", "success");
            }
            return; 
        }
        
        document.querySelectorAll(".list li").forEach(li => li.classList.remove("active"));
        item.classList.add("active");
        currentItem = item;
        const id = parseInt(item.getAttribute("data-id"));
        const msg = messages.find(m => m.id === id);
        
        
        // Sembunyikan semua field edit terlebih dahulu
        document.querySelectorAll("#editArea .edit-fields").forEach(f => f.style.display = 'none');
        
        const contentType = msg.contentType || 'text';
        
        if (contentType === 'text') {
            editFieldsText.style.display = 'block';
            messageInput.value = msg.text;
            messageInput.disabled = false;
        } else if (contentType === 'image') {
            editFieldsImage.style.display = 'block';
            currentImageUrl.textContent = msg.content.url || 'Tidak ada URL'; // DIGANTI
            editImageUrlInput.value = msg.content.url || ''; // DIGANTI
            editImageCaption.value = msg.content.caption || '';
        } else if (contentType === 'file') {
            editFieldsFile.style.display = 'block';
            currentFileUrl.textContent = msg.content.url || 'Tidak ada URL'; // DIGANTI
            editFileUrlInput.value = msg.content.url || ''; // DIGANTI
            editFileCaption.value = msg.content.caption || '';
        }
        // ----------------------------------------------------

        emptyState.style.display = "none";
        editArea.style.display = "block";

        loadMessageSettings(msg);
    });
}

// FUNGSI: Reset editor
function resetEditor() {
    messageInput.value = "";
    messageInput.disabled = false; // Pastikan aktif lagi saat reset
    emptyState.style.display = "block";
    editArea.style.display = "none";
    currentItem = null;
    document.querySelectorAll(".list li").forEach(li => li.classList.remove("active"));
    
    // Reset inputs URL
    if (editImageUrlInput) editImageUrlInput.value = '';
    if (editImageCaption) editImageCaption.value = '';
    if (editFileUrlInput) editFileUrlInput.value = '';
    if (editFileCaption) editFileCaption.value = '';
    
    if (scheduleDateInput) { 
        scheduleDateInput.value = ''; 
    }
    if (scheduleTimeInput) {
        scheduleTimeInput.value = '';
    }
    if (contactSearchInput) { 
        contactSearchInput.value = '';
    }
    
    loadApiKeys(); 
}

// === Tambah pesan baru (Modal) ===
addBtn.addEventListener("click", () => {
    titleInput.value = "";
    newMessageInput.value = "";
    
    // Reset field Gambar/File modal tambah
    if (imageUrlInput) imageUrlInput.value = '';
    if (imageCaption) imageCaption.value = '';
    if (fileUrlInput) fileUrlInput.value = '';
    if (fileCaption) fileCaption.value = '';

    // Reset chips ke default 'Teks'
    if (contentChips) {
        document.querySelectorAll('#contentChips .chip').forEach(c => c.classList.remove('active'));
        document.querySelector('.chip[data-type="text"]').classList.add('active');
        document.querySelectorAll('#addModal .content-fields').forEach(f => f.style.display = 'none');
        if (textFields) textFields.style.display = 'block';
    }

    addModal.style.display = 'block';
});

// === Simpan perubahan (Editor) ===
saveBtn.addEventListener("click", () => {
    if (currentItem) {
        saveCurrentMessageChanges(false); // Jangan reset editor setelah save
    } else {
        showNotification("Pilih pesan yang ingin disimpan dahulu!", "error");
    }
});

// === Batal edit (Editor) ===
cancelBtn.addEventListener("click", () => {
    if (currentItem) {
        const id = parseInt(currentItem.getAttribute("data-id"));
        const msg = messages.find(m => m.id === id);
        
        // Muat ulang konten
        if (msg.contentType === 'text') {
            messageInput.value = msg.text;
        } else if (msg.contentType === 'image') {
            if (editImageCaption) editImageCaption.value = msg.content.caption || '';
            if (editImageUrlInput) editImageUrlInput.value = msg.content.url || ''; // DIGANTI
        } else if (msg.contentType === 'file') {
            if (editFileCaption) editFileCaption.value = msg.content.caption || '';
            if (editFileUrlInput) editFileUrlInput.value = msg.content.url || ''; // DIGANTI
        }
        
        loadMessageSettings(msg);
        showNotification('Perubahan dibatalkan. Mengembalikan data tersimpan.', 'info');
    }
    
    resetEditor();
});

modalCancelBtn.addEventListener('click', hideModal); 

// --- INISIALISASI & LOGIKA CHIPS ---
document.addEventListener('DOMContentLoaded', () => {
    loadMessages();
    loadApiKeys(); 
    resetEditor();

    // --- LOGIKA KONTROL CHIPS MODAL TAMBAH ---
    if (contentChips) {
        contentChips.addEventListener('click', function(event) {
            const chip = event.target;
            if (chip.classList.contains('chip')) {
                const type = chip.getAttribute('data-type');
                
                // Mapping field berdasarkan data-type chip
                const allFields = {
                    'text': textFields,
                    'image': imageFields,
                    'file': fileFields
                };

                // 1. Hapus status 'active' dari semua chip
                document.querySelectorAll('#contentChips .chip').forEach(c => c.classList.remove('active'));
                
                // 2. Sembunyikan semua field konten (kecuali yang dipilih)
                document.querySelectorAll('#addModal .content-fields').forEach(f => f.style.display = 'none');

                // 3. Set chip yang diklik menjadi 'active'
                chip.classList.add('active');

                // 4. Tampilkan field yang sesuai
                if (allFields[type]) {
                    allFields[type].style.display = 'block';
                }
            }
        });
    }
    // -----------------------------------

    if (contactSearchInput) {
        contactSearchInput.addEventListener('input', () => {
            populateDropdown(contactSearchInput.value.toLowerCase().trim());
        });
    }
});

// --- Fungsionalitas Modal ---
closeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modalId = e.target.closest('.close-btn').getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    });
});

modalAddCancelBtn.addEventListener('click', () => {
    addModal.style.display = 'none';
});

// FUNGSI: Membuat pesan baru (Di-modifikasi untuk Multi-Konten)
modalCreateBtn.addEventListener("click", () => {
    const newTitle = titleInput.value.trim();
    
    const activeChip = document.querySelector('#contentChips .chip.active');
    const contentType = activeChip ? activeChip.getAttribute('data-type') : 'text';

    let newContent = {};
    let isContentValid = true;
    let initialText = '';

    if (contentType === 'text') {
        const text = newMessageInput.value.trim();
        if (text === "") {
            showNotification("Isi Pesan Teks tidak boleh kosong!", "error");
            isContentValid = false;
        }
        newContent = { text: text };
        initialText = text;
    } else if (contentType === 'image') {
        const url = imageUrlInput ? imageUrlInput.value.trim() : ''; // DIGANTI
        const caption = imageCaption ? imageCaption.value.trim() : '';
        
        if (url === "") { // Validasi URL
            showNotification("URL Gambar tidak boleh kosong!", "error");
            isContentValid = false;
        }
        
        const fileName = url ? url.split('/').pop().split('?')[0] : null; 
        newContent = { url: url, file_name: fileName, caption: caption }; // Simpan URL
        initialText = caption; 
    } else if (contentType === 'file') {
        const url = fileUrlInput ? fileUrlInput.value.trim() : ''; // DIGANTI
        const caption = fileCaption ? fileCaption.value.trim() : '';
        
        if (url === "") { // Validasi URL
            showNotification("URL File Dokumen tidak boleh kosong!", "error");
            isContentValid = false;
        }
        
        const fileName = url ? url.split('/').pop().split('?')[0] : null;
        newContent = { url: url, file_name: fileName, caption: caption }; // Simpan URL
        initialText = caption;
    }

    if (newTitle === "") {
        showNotification("Judul Pesan tidak boleh kosong!", "error");
        return;
    }

    if (!isContentValid) {
        return;
    }

    const newId = Date.now();
    
    const newMsg = { 
        id: newId, 
        title: newTitle, 
        contentType: contentType, 
        text: initialText, 
        content: newContent,
        apiKey: null,
        scheduleMode: '',
        scheduleValue: '',
        active: true,
        recipients: [] 
    };
    
    messages.push(newMsg);
    saveMessages();
    renderMessages();
    
    addModal.style.display = 'none';

    const newItem = document.querySelector(`[data-id="${newId}"]`);
    if (newItem) {
        newItem.click();
        showNotification("Pesan baru berhasil dibuat!", "success");
    }
});


// --- Fungsionalitas Modal Kirim Pesan & Multi-Select ---

// FUNGSI: Me-render chip kontak yang dipilih
function renderSelectedContacts() {
    selectedContactsContainer.innerHTML = '';
    
    selectedContacts.forEach((contact, number) => {
        const chip = document.createElement('div');
        chip.className = 'contact-chip';
        chip.innerHTML = `${contact.nama} (${contact.nomor}) <span class="chip-close" data-number="${number}">&times;</span>`;
        
        chip.querySelector('.chip-close').addEventListener('click', (e) => {
            const numToRemove = e.target.getAttribute('data-number');
            removeContact(numToRemove);
        });
        
        selectedContactsContainer.appendChild(chip);
    });
}

// FUNGSI: Menyinkronkan pilihan dropdown ke Map dan Chip
function syncSelectedContacts() {
    selectedContacts.clear(); 
    
    const storedContacts = localStorage.getItem('customKontak');
    const dummyContacts = [
        { nama: "Budi", nomor: "6281234567890" },
        { nama: "Sinta", nomor: "6287654321098" },
        { nama: "Joko", nomor: "6289876543210" },
        { nama: "Ani", nomor: "6285511223344" },
    ];
    const contacts = storedContacts ? JSON.parse(storedContacts) : dummyContacts;
    
    Array.from(contactDropdown.selectedOptions).forEach(option => {
        const number = option.value; 
        
        // Cari kontak lengkap
        const contact = contacts.find(c => c.nomor === number);
        
        if (contact) {
            selectedContacts.set(number, contact);
        } else {
             // Fallback: Gunakan nama dari dropdown jika data kontak lengkap tidak ada
             const fullText = option.textContent.trim();
             const firstParenIndex = fullText.indexOf('(');
             const name = firstParenIndex !== -1 ? fullText.substring(0, firstParenIndex).trim() : fullText;
             selectedContacts.set(number, { nama: name, nomor: number });
        }
    });
    
    renderSelectedContacts();
}

// FUNGSI: Menghapus kontak dari Map
function removeContact(number) {
    selectedContacts.delete(number);
    const option = contactDropdown.querySelector(`option[value="${number}"]`);
    if (option) {
        option.selected = false;
    }
    syncSelectedContacts(); 
}

// FUNGSI: Mengisi dropdown dengan nomor kontak (didukung pencarian)
function populateDropdown(searchQuery = '') {
    contactDropdown.innerHTML = ''; 
    const savedContacts = localStorage.getItem('customKontak');
    const dummyContacts = [
        { nama: "Budi", nomor: "6281234567890" },
        { nama: "Sinta", nomor: "6287654321098" },
        { nama: "Joko", nomor: "6289876543210" },
        { nama: "Ani", nomor: "6285511223344" },
    ];

    const contacts = savedContacts ? JSON.parse(savedContacts) : dummyContacts;
    
    const filteredContacts = contacts.filter(contact => {
        const contactText = `${contact.nama} ${contact.nomor}`.toLowerCase();
        return contactText.includes(searchQuery);
    });
    
    filteredContacts.forEach(contact => {
        const option = document.createElement('option');
        option.value = contact.nomor;
        option.textContent = `${contact.nama} (${contact.nomor})`;
        
        // Memilih opsi jika nomor ada di Map selectedContacts
        if (selectedContacts.has(contact.nomor)) {
            option.selected = true;
        }
        
        contactDropdown.appendChild(option);
    });
    
    if (filteredContacts.length === 0 && searchQuery) {
        const option = document.createElement('option');
        option.textContent = `Tidak ada kontak ditemukan untuk "${searchQuery}"`;
        option.disabled = true;
        contactDropdown.appendChild(option);
    }
}

// FUNGSI: Menampilkan modal Kirim (memuat penerima tersimpan)
function showSendModal() {
    sendModal.style.display = 'block';
    
    if (contactSearchInput) { 
        contactSearchInput.value = '';
    }
    
    const id = parseInt(currentItem.getAttribute("data-id"));
    const msg = messages.find(m => m.id === id);
    
    // 1. Muat Recipients dari Pesan yang Tersimpan
    selectedContacts.clear(); // Reset Map
    
    if (msg.recipients && msg.recipients.length > 0) {
        const storedContacts = localStorage.getItem('customKontak');
        const dummyContacts = [
            { nama: "Budi", nomor: "6281234567890" },
            { nama: "Sinta", nomor: "6287654321098" },
            { nama: "Joko", nomor: "6289876543210" },
            { nama: "Ani", nomor: "6285511223344" },
        ];
        const contacts = storedContacts ? JSON.parse(storedContacts) : dummyContacts;
        
        // Isi Map selectedContacts dengan data kontak lengkap berdasarkan nomor yang tersimpan
        msg.recipients.forEach(number => {
            const contact = contacts.find(c => c.nomor === number);
            // Tambahkan hanya jika kontak ditemukan di daftar kontak
            if (contact) {
                selectedContacts.set(number, contact); 
            } else {
                 selectedContacts.set(number, { nama: number, nomor: number });
            }
        });
    }
    // 2. Populate Dropdown (akan otomatis memilih yang ada di Map)
    populateDropdown(); 
    
    // 3. Render Chips (menampilkan chip kontak yang dimuat)
    renderSelectedContacts(); 
    
    // 4. Load API Key dan Schedule settings
    loadMessageSettings(msg); 
}

// EVENT LISTENERS DROPDOWN (Memungkinkan Multi-Select tanpa Ctrl/Cmd)
contactDropdown.addEventListener('mousedown', function(e) {
    if (e.target.tagName === 'OPTION') {
        e.preventDefault(); 
        e.target.selected = !e.target.selected;
        syncSelectedContacts();
        this.focus(); 
    }
});

contactDropdown.addEventListener('change', function() {
    syncSelectedContacts();
});


// Event listener untuk tombol "Kirim" utama
sendBtn.addEventListener('click', () => {
    if (currentItem) {
        const id = parseInt(currentItem.getAttribute("data-id"));
        const msg = messages.find(m => m.id === id);
        
        if (!msg.active) {
             showNotification("Pesan ini sedang dinonaktifkan. Aktifkan dahulu untuk mengirim.", "warning");
             return;
        }

        // Cek konten apakah kosong sebelum kirim
        let contentCheck = true;
        if (msg.contentType === 'text' && msg.text.trim() === "") {
            contentCheck = false;
        } else if ((msg.contentType === 'image' || msg.contentType === 'file') && !msg.content.url) { // Cek URL
             contentCheck = false;
        }

        if (contentCheck) {
            // Simpan API Key dan Schedule sebelum membuka modal
            saveCurrentMessageChanges(false); 
            showSendModal();
        } else {
            showNotification("Konten pesan tidak boleh kosong! (Pastikan URL/Teks sudah diisi)", "error");
        }
        
    } else {
        showNotification("Pilih pesan di daftar terlebih dahulu!", "error");
    }
});

// Event listener untuk tombol "Kirim" di dalam modal (Simpan Penerima & Panggil API)
modalSendBtn.addEventListener('click', async function() {
    
    if (!currentItem) {
        showNotification('Pilih pesan yang ingin dikirim di daftar.', 'error');
        hideModal(); 
        return;
    }
    
    // 1. OTOMATIS SIMPAN PENGATURAN KIRIM (API Key, Mode & Nilai)
    saveCurrentMessageChanges(false); 

    const numbersToSend = Array.from(selectedContacts.keys());
    
    const id = parseInt(currentItem.getAttribute("data-id"));
    const msg = messages.find(m => m.id === id);

    const selectedApiKeyValue = msg.apiKey.value || ''; 
    
    if (numbersToSend.length === 0) {
        showNotification('Pilih minimal satu nomor untuk dikirim!', 'error');
        return;
    }
    
    if (selectedApiKeyValue === '' || selectedApiKeyValue === 'Tidak ada API Key tersedia') {
        showNotification('API Key belum dipilih atau belum tersedia! Cek Config.', 'error');
        return;
    }

    // --- KRUSIAL: Simpan Daftar Penerima ke Objek Pesan Aktif ---
    msg.recipients = numbersToSend; 
    saveMessages(); 
    // ----------------------------------------------------------------

    // 2. Kumpulkan data untuk dikirim ke SERVER LARAVEL
    
    const finalScheduleMode = msg.scheduleMode || ''; 
    const finalScheduleValue = msg.scheduleValue || ''; 
    
    let formData = new FormData();
    formData.append('api_key', selectedApiKeyValue);
    
    // Perbaiki format schedule time agar Laravel bisa memprosesnya
    let scheduleTime = '';
    if (finalScheduleMode === 'once' && finalScheduleValue) {
        // Jika terjadwal, ambil hanya bagian jam (asumsi Laravel akan mengurus tanggal)
        scheduleTime = finalScheduleValue.split('T')[1] || ''; 
        // Tambahkan tanggal lengkap untuk membantu Laravel memproses
        formData.append('schedule_date', finalScheduleValue.split('T')[0] || ''); 
    } else if (finalScheduleMode === 'daily' && finalScheduleValue) {
        scheduleTime = finalScheduleValue;
    }
    
    formData.append('schedule_time', scheduleTime); 
    
    // Lampirkan semua nomor
    numbersToSend.forEach(number => {
        formData.append('phone_no[]', number); 
    });
    
    // Lampirkan tipe konten
    formData.append('content_type', msg.contentType);

    if (msg.contentType === 'text') {
        if (msg.text.trim() === "") {
             showNotification('Isi pesan teks tidak boleh kosong!', 'error');
             return;
        }
        formData.append('message', msg.text); 
        
    } else if (msg.contentType === 'image' || msg.contentType === 'file') {
        if (!msg.content.url) { 
            showNotification(`Pesan ${msg.contentType} belum memiliki URL file!`, 'error');
            return;
        }
        // Kirim metadata file (URL, caption, filename) ke Laravel
        formData.append('caption', msg.content.caption || '');
        formData.append('file_url', msg.content.url); 
        formData.append('filename', msg.content.file_name); 
    } 

    // Panggil fungsi pengiriman API ke Laravel
    await sendBroadcastMessage(formData);
    
    // 3. Tutup modal setelah pemicu pengiriman
    hideModal();
});

// FUNGSI KRUSIAL: MENGIRIM DATA KE BACKEND LARAVEL VIA FETCH (Digunakan untuk SEMUA TIPE KONTEN)
async function sendBroadcastMessage(data) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    
    // Ambil nomor untuk notifikasi
    let numbers = [];
    if (data.get && data.getAll('phone_no[]')) {
        numbers = data.getAll('phone_no[]'); 
    }
    
    showNotification(`Memulai pengiriman ke ${numbers.length} kontak via Server Laravel...`, 'info');
    
    modalSendBtn.textContent = 'Mengirim...';
    modalSendBtn.disabled = true;

    let headers = {
        'X-CSRF-TOKEN': csrfToken 
    };
    
    try {
        const response = await fetch('/api/send-watzap', { 
            method: 'POST',
            headers: headers,
            body: data 
        });
        
        if (!response.ok) {
            if (response.status === 302) {
                 showNotification(`❌ Gagal: Akses Ditolak (302 Found). Pastikan Anda sudah login & rute API benar!`, 'error');
                 console.error("302 Found Error. Kemungkinan redirect ke halaman login/error (Auth/CSRF/Middleware).");
                 return;
            }
            
            const errorText = await response.text();
            
            if (errorText.trim().startsWith('<!DOCTYPE')) {
                showNotification(`❌ Gagal koneksi (HTTP ${response.status}). Cek CSRF Token atau Rute Server!`, 'error');
                console.error("Server returned HTML Error (Expected JSON), likely CSRF or Route issue:", errorText);
            } else {
                try {
                    const errorData = JSON.parse(errorText);
                    showNotification(`❌ Gagal mengirim: ${errorData.message || 'Error server tidak diketahui.'}`, 'error');
                    console.error("Server JSON Error:", errorData);
                } catch(e) {
                     showNotification(`❌ Gagal (HTTP ${response.status}): Respons server tidak terduga.`, 'error');
                     console.error("Non-HTML, Non-JSON Response:", errorText);
                }
            }
            return;
        }

        const responseData = await response.json();
        
        if (responseData.status === 'success') {
            showNotification(`✅ Semua pesan berhasil dikirim via Laravel!`, 'success');
            console.log("Pengiriman Sukses:", responseData);
        } else {
            showNotification(`⚠️ Gagal di Server Laravel: ${responseData.message}`, 'warning');
            console.warn("Pengiriman Gagal di Server Laravel (Cek Log Server):", responseData);
        }
        
    } catch (error) {
        showNotification('Fatal Error: Gagal koneksi atau respons bukan JSON.', 'error');
        console.error('Fatal Fetch Error:', error);
    } finally {
        modalSendBtn.textContent = 'Kirim';
        modalSendBtn.disabled = false;
    }
}


// Sembunyikan modal saat mengklik di luar area modal
window.addEventListener('click', function(event) {
    if (event.target === sendModal) {
        hideModal();
    }
    if (event.target === addModal) {
        addModal.style.display = 'none';
    }
});