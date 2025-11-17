document.addEventListener('DOMContentLoaded', function() {
    const customKontakList = document.getElementById('custom-kontak-list');
    const addKontakBtn = document.querySelector('.add-kontak-btn');
    const noKontakText = document.getElementById('no-kontak-text');

    // Elemen Modal
    const modal = document.getElementById('kontakModal');
    const closeModalBtn = document.querySelector('.close-btn');
    const modalTitle = document.getElementById('modalTitle');
    const modalSaveBtn = document.getElementById('modalSaveBtn');
    const inputNama = document.getElementById('inputNama');
    const inputNomor = document.getElementById('inputNomor');

    let isEditing = false;
    let currentEditCard = null;

    // Fungsi untuk mendapatkan data PIC saat ini (Simulasi dari server)
    function getTodayPIC() {
        // Dalam implementasi nyata, fungsi ini akan memanggil API atau database
        // untuk mendapatkan data PIC hari ini.
        return {
            nama: 'Ardion Massaid', // Contoh nama
            nomor: '0895410873276 (PIC)' // Contoh nomor
        };
    }

    // Fungsi untuk menyimpan data ke Local Storage
    function saveToLocalStorage() {
        const kontak = [];
        document.querySelectorAll('#custom-kontak-list .kontak-card').forEach(card => {
            const nama = card.querySelector('h4').textContent;
            const nomor = card.querySelector('p').textContent;
            kontak.push({ nama, nomor });
        });
        localStorage.setItem('customKontak', JSON.stringify(kontak));
    }

    // Fungsi untuk membuat elemen kartu kontak dari data
    function createKontakCard(nama, nomor, isPic = false) {
        const newKontakCard = document.createElement('div');
        newKontakCard.className = 'kontak-card';
        if (isPic) {
            newKontakCard.classList.add('kontak-card-pic');
        }

        let actionsHTML = '';
        if (!isPic) {
            actionsHTML = `
                <div class="kontak-actions">
                    <button class="edit-btn"><i class="fas fa-pencil-alt"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
        }

        newKontakCard.innerHTML = `
            <i class="fas fa-user-circle fa-3x"></i>
            <div class="kontak-info">
                <h4>${nama}</h4>
                <p>${nomor}</p>
            </div>
            ${actionsHTML}
        `;
        return newKontakCard;
    }

    // Fungsi untuk memuat data dari Local Storage
    function loadFromLocalStorage() {
        const kontakString = localStorage.getItem('customKontak');
        let kontak = kontakString ? JSON.parse(kontakString) : [];

        // Dapatkan data PIC terbaru
        const todayPIC = getTodayPIC();

        // Hapus kontak PIC sebelumnya dari array untuk menghindari duplikasi saat data diperbarui
        kontak = kontak.filter(item => item.nama !== todayPIC.nama);

        // Tambahkan PIC terbaru ke posisi paling awal
        kontak.unshift(todayPIC);

        // Kosongkan list di halaman sebelum menampilkan yang baru
        customKontakList.innerHTML = '';

        // Tampilkan semua kontak ke halaman dengan penanganan khusus untuk PIC
        kontak.forEach(item => {
            const isPic = (item.nama === todayPIC.nama);
            customKontakList.appendChild(createKontakCard(item.nama, item.nomor, isPic));
        });

        // Simpan kembali array kontak yang sudah diperbarui ke localStorage
        localStorage.setItem('customKontak', JSON.stringify(kontak));
        
        updateNoKontakMessage();
    }

    function updateNoKontakMessage() {
        if (customKontakList.children.length === 0) {
            noKontakText.style.display = 'block';
        } else {
            noKontakText.style.display = 'none';
        }
    }

    function resetModal() {
        modalTitle.textContent = 'Tambah Kontak Baru';
        modalSaveBtn.textContent = 'Tambahkan';
        inputNama.value = '';
        inputNomor.value = '';
        isEditing = false;
        currentEditCard = null;
    }

    // Tampilkan modal untuk menambah kontak
    addKontakBtn.addEventListener('click', function() {
        resetModal();
        modal.style.display = 'block';
    });

    // Sembunyikan modal saat tombol 'x' diklik
    closeModalBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Sembunyikan modal saat mengklik di luar area modal
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Tangani klik tombol "Tambahkan" atau "Simpan Perubahan" di dalam modal
    modalSaveBtn.addEventListener('click', function() {
        const nama = inputNama.value.trim();
        const nomor = inputNomor.value.trim();

        if (!nama || !nomor) {
            alert("Nama dan nomor telepon harus diisi!");
            return;
        }

        if (isEditing) {
            // Logika untuk menyimpan perubahan
            currentEditCard.querySelector('h4').textContent = nama;
            currentEditCard.querySelector('p').textContent = nomor;
        } else {
            // Logika untuk menambahkan kontak baru
            const newKontakCard = createKontakCard(nama, nomor);
            customKontakList.appendChild(newKontakCard);
        }
        modal.style.display = 'none';
        updateNoKontakMessage();
        saveToLocalStorage();
    });

    // Event listener untuk tombol edit dan hapus
    customKontakList.addEventListener('click', function(event) {
        const kontakCard = event.target.closest('.kontak-card');
        if (!kontakCard || kontakCard.classList.contains('kontak-card-pic')) return;

        if (event.target.closest('.delete-btn')) {
            // Logika untuk menghapus kontak
            kontakCard.remove();
            updateNoKontakMessage();
            saveToLocalStorage();
        } else if (event.target.closest('.edit-btn')) {
            // Logika untuk mengedit kontak
            isEditing = true;
            currentEditCard = kontakCard;
            modalTitle.textContent = 'Edit Kontak';
            modalSaveBtn.textContent = 'Simpan Perubahan';

            const nama = kontakCard.querySelector('h4').textContent;
            const nomor = kontakCard.querySelector('p').textContent;

            inputNama.value = nama;
            inputNomor.value = nomor;

            modal.style.display = 'block';
        }
    });

    // Panggil fungsi ini saat halaman pertama kali dimuat
    loadFromLocalStorage();
});