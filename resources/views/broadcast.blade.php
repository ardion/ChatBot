@extends('layouts.app')

@section('title', 'Broadcast Manager')

@push('styles')
<link rel="stylesheet" href="{{ asset('css/broadcast.css') }}">
<meta name="csrf-token" content="{{ csrf_token() }}">
@endpush

@section('content')
  <header>📢 Broadcast Manager</header>

  <div class="broadcast-container">
    <div class="list">
      <h2>Daftar Pesan</h2>
      <button id="addBtn">+ Tambah Pesan</button>
      <ul id="broadcastList"></ul>
    </div>

    <div class="editor">
    <h2>Edit Pesan</h2>
      <div id="emptyState" class="placeholder">Pilih pesan untuk diedit</div>
      <div id="editArea" style="display:none;">
          
         <div id="editFieldsText" class="edit-fields active-edit-field">
            <textarea id="messageInput"></textarea>
        </div>

        <div id="editFieldsImage" class="edit-fields" style="display:none;">
            <p><strong>File Terpilih:</strong> <span id="currentImageFile">-</span></p>
            <label for="editImageUpload" style="margin-top: 10px;">Ganti Gambar:</label>
            <input type="file" id="editImageUpload" accept="image/*">
            <label for="editImageCaption" style="margin-top: 15px;">Caption:</label>
            <textarea id="editImageCaption"></textarea>
        </div>

        <div id="editFieldsFile" class="edit-fields" style="display:none;">
            <p><strong>File Terpilih:</strong> <span id="currentFileFile">-</span></p>
            <label for="editFileUpload" style="margin-top: 10px;">Ganti File:</label>
            <input type="file" id="editFileUpload" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
            <label for="editFileCaption" style="margin-top: 15px;">Caption:</label>
            <textarea id="editFileCaption"></textarea>
        </div>
        
        <div class="send-options-group">
             <div class="select-wrapper api-key-select">
                <label for="apiKeySelect">Pilih API Key :</label>
                <select id="apiKeySelect"></select>
            </div>
            
            <div class="select-wrapper schedule-options">
                <label>Opsi Penjadwalan (Opsional):</label>
                
                <div class="schedule-inputs-group">
                    <input type="date" id="scheduleDateInput" placeholder="Tanggal Tertentu">
                    
                    <input type="time" id="scheduleTimeInput" placeholder="Jam Pengiriman">
                </div>

                <small style="margin-top: 5px;">
                    <ul>
                        <li>Kosongkan keduanya = **Kirim Langsung**</li>
                        <li>Isi **Jam** saja = **Kirim Harian**</li>
                        <li>Isi **Tanggal & Jam** = **Kirim Terjadwal**</li>
                    </ul>
                </small>
            </div>
        </div>
        
        <div class="buttons">
          <button class="save" id="saveBtn">Simpan</button>
          <button class="cancel" id="cancelBtn">Batal</button>
          <button class="send-btn" id="sendBtn">Kirim</button>
        </div>
      </div>
    </div>
  </div>

  <div id="sendModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Kirim Pesan Broadcast</h2>
        <span class="close-btn" data-modal="sendModal">&times;</span>
      </div>
      <div class="modal-body">
        
        <div class="search-input-wrapper">
        <label for="contact-search">Cari Nomor / Nama Kontak:</label>
        <input type="text" id="contact-search" placeholder="Ketik nama atau nomor..."> 
        </div>
        
        <label for="contact-dropdown" style="margin-top: 15px;">Pilih Nomor:</label>
        <select id="contact-dropdown" multiple size="5"></select> 
        
        <label for="selectedContactsContainer" style="margin-top: 15px;">Kontak Terpilih:</label>
        <div id="selectedContactsContainer" class="contact-chips-container">
          </div>
      </div>
      <div class="modal-footer">
        <button id="modalSendBtn" class="send-btn">Kirim</button>
        <button id="modalCancelBtn" class="cancel">Batal</button>
      </div>
    </div>
  </div>


<div id="addModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Buat Pesan Baru</h2>
            <span class="close-btn" data-modal="addModal">&times;</span>
        </div>
        <div class="modal-body">
            <label for="titleInput">Judul Pesan:</label>
            <input type="text" id="titleInput" placeholder="Masukkan judul pesan">

            <label style="margin-top: 15px;">Tipe Konten:</label>
            <div class="content-chips" id="contentChips">
                <span class="chip active" data-type="text">Teks</span>
                <span class="chip" data-type="image">Gambar</span>
                <span class="chip" data-type="file">File</span>
            </div>
            
            <div id="textFields" class="content-fields active-fields">
                <label for="newMessageInput" style="margin-top: 15px;">Isi Pesan Teks:</label>
                <textarea id="newMessageInput" placeholder="Tulis isi pesan teks di sini"></textarea>
            </div>

            <div id="imageFields" class="content-fields" style="display:none;">
                <label for="imageUpload" style="margin-top: 15px;">Unggah Gambar:</label>
                <input type="file" id="imageUpload" accept="image/*">
                
                <label for="imageCaption" style="margin-top: 15px;">Caption (Opsional):</label>
                <textarea id="imageCaption" placeholder="Tulis caption gambar di sini"></textarea>
            </div>

            <div id="fileFields" class="content-fields" style="display:none;">
                <label for="fileUpload" style="margin-top: 15px;">Unggah File Dokumen:</label>
                <input type="file" id="fileUpload" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
                
                <label for="fileCaption" style="margin-top: 15px;">Caption (Opsional):</label>
                <textarea id="fileCaption" placeholder="Tulis caption file di sini"></textarea>
            </div>

        </div>
        <div class="modal-footer">
            <button id="modalCreateBtn" class="save">Buat & Edit</button>
            <button id="modalAddCancelBtn" class="cancel">Batal</button>
        </div>
    </div>
</div>
  <div id="notification" class="notification hidden"></div>
@endsection

@push('scripts')
<script src="{{ asset('js/broadcast.js') }}"></script>
@endpush
