document.addEventListener('DOMContentLoaded', function() {
    // --- 1. FUNGSI PENCARIAN REAL-TIME (Client-Side) ---
    const searchInput = document.getElementById('searchInput');
    const kontakTableBody = document.getElementById('kontakTableBody');
    
    // Pastikan elemen ditemukan sebelum melanjutkan
    if (searchInput && kontakTableBody) {
        // Ambil semua baris data di awal
        const rows = kontakTableBody.getElementsByTagName('tr');

        searchInput.addEventListener('keyup', function() {
            const filter = searchInput.value.toLowerCase();
            let visibleRowCount = 0;
            
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                
                // Cek apakah baris tersebut adalah baris data normal, bukan pesan "Belum ada kontak"
                // Baris data biasanya memiliki 4 sel (kolom)
                if (row.cells.length > 3) {
                    // Kolom Nama (index 1) dan Nomor Telepon (index 2)
                    const nameCell = row.cells[1]; 
                    const numberCell = row.cells[2];
                    
                    if (nameCell && numberCell) {
                        const nameText = nameCell.textContent.toLowerCase();
                        const numberText = numberCell.textContent.toLowerCase();
                        
                        if (nameText.includes(filter) || numberText.includes(filter)) {
                            row.style.display = ""; // Tampilkan baris
                            visibleRowCount++;
                        } else {
                            row.style.display = "none"; // Sembunyikan baris
                        }
                    }
                }
            }
            
            // Logika untuk menampilkan pesan "Tidak ditemukan" (Opsional: dapat disempurnakan)
            // Di sini kita berasumsi pesan "Belum ada kontak" ditangani oleh Blade/Server.
            // Jika Anda ingin pesan "Pencarian tidak ditemukan" di klien, Anda harus menambahkannya di sini.
        });
    }

    // --- 2. FUNGSI KONFIRMASI HAPUS (Ganti alert/confirm standar) ---
    const deleteForms = document.querySelectorAll('.delete-form');

    deleteForms.forEach(form => {
        form.addEventListener('submit', function(event) {
            // Dapatkan baris <tr> terdekat
            const row = this.closest('tr');
            // Ambil Nama Kontak dari kolom ke-2 (index 1)
            const contactName = row.cells[1] ? row.cells[1].textContent.trim() : 'kontak ini';

            // Mengganti alert/confirm standar dengan konfirmasi kustom
            if (!confirm(`Apakah Anda yakin ingin menghapus kontak: ${contactName}? \n\nPerhatian: Aksi ini tidak dapat dibatalkan.`)) {
                event.preventDefault(); // Batalkan submit form jika pengguna memilih 'Cancel'
            }
        });
    });
});
