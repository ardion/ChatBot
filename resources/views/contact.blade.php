@extends('layouts.app')

@section('title', 'Daftar Kontak')

@push('styles')
<link rel="stylesheet" href="{{ asset('css/kontak.css') }}">
@endpush

@section('content')
<div class="kontak-container">
    <div class="kontak-header">
        <h2>Daftar Kontak</h2>
        <button class="add-kontak-btn">
            <i class="fas fa-plus"></i> Tambah Kontak
        </button>
    </div>

    <div id="custom-kontak-list">
        <p class="text-muted text-center" id="no-kontak-text" style="display: none;">Belum ada kontak kustom.</p>
    </div>
</div>

<div id="kontakModal" class="modal">
    <div class="modal-content">
        <span class="close-btn">&times;</span>
        <h3 id="modalTitle">Tambah Kontak Baru</h3>
        <label for="inputNama">Nama Kontak:</label>
        <input type="text" id="inputNama" placeholder="Masukkan nama...">
        <label for="inputNomor">Nomor Telepon:</label>
        <input type="text" id="inputNomor" placeholder="Masukkan nomor...">
        <button id="modalSaveBtn">Tambahkan</button>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/kontak.js') }}"></script>
@endpush