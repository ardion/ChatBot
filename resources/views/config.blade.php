@extends('layouts.app')

@section('title', 'API Key Config')

@section('content')
<div class="config-container">
  <h1>Konfigurasi API Key</h1>

  <!-- Tombol tambah di kanan -->
  <div class="config-actions">
    <button class="btn btn-success" id="openModalBtn">+ Tambah API Key</button>
  </div>

  <!-- List API Key -->
  <ul class="apikey-list" id="apikeyList"></ul>

  <!-- Simpan -->
  <button class="btn btn-primary" id="saveBtn">Simpan Pilihan</button>
</div>

<!-- Modal -->
<div class="modal" id="addModal">
  <div class="modal-content">
    <div class="modal-header">Tambah API Key</div>
    <input type="text" id="newName" placeholder="Nama API Key">
    <input type="text" id="newValue" placeholder="Value API Key">
    <div class="modal-actions">
      <button class="btn btn-cancel" id="closeModalBtn">Batal</button>
      <button class="btn btn-success" id="addBtn">Tambah</button>
    </div>
  </div>
</div>

@endsection

@push('styles')
<link rel="stylesheet" href="{{ asset('css/config.css') }}">
@endpush

@push('scripts')
<script src="{{ asset('js/config.js') }}"></script>
@endpush
