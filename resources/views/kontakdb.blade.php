@extends('layouts.app')

@section('title', 'Daftar Kontak')

@push('styles')
<link rel="stylesheet" href="{{ asset('css/kontakdb.css') }}">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
@endpush

@section('content')
<div class="kontakdb-container">
    <div class="kontakdb-header">
        <h2>Daftar Kontak</h2>
        
        {{-- INPUT SEARCH BARU DITAMBAHKAN DI SINI --}}
        <div class="search-container">
            <input type="text" id="searchInput" placeholder="Cari Nama atau Nomor..." class="search-input">
            <i class="fas fa-search search-icon"></i>
        </div>
        {{-- AKHIR INPUT SEARCH --}}
        
    </div>
    
    <div class="kontakdb-list-table">
        <table class="table table-striped" id="kontakTable"> 
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Nama Kontak</th>
                    <th>Nomor Telepon</th>
                    <th class="action-column">Aksi</th>
                </tr>
            </thead>
            <tbody id="kontakTableBody"> 
                @php
                    // Hapus blok @php ini saat sudah terintegrasi dengan Controller
                    $kontaks = [
                        (object)['id' => 1, 'nama' => 'Budi Santoso', 'nomor' => '0812-3456-7890'],
                        (object)['id' => 2, 'nama' => 'Siti Rahayu', 'nomor' => '0856-7890-1234'],
                        (object)['id' => 3, 'nama' => 'Agus Dharma', 'nomor' => '0878-1122-3344'],
                    ];
                @endphp
                
                {{-- Lakukan looping pada variabel $kontaks --}}
                @if(count($kontaks) > 0)
                    @foreach($kontaks as $index => $kontak)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $kontak->nama }}</td>
                        <td>{{ $kontak->nomor }}</td>
                        <td class="action-column">
                            <a href="{{ url('/contact/' . $kontak->id) }}" class="btn btn-sm btn-info" title="Detail"><i class="fas fa-eye"></i></a>
                            <a href="{{ url('/contact/edit/' . $kontak->id) }}" class="btn btn-sm btn-warning" title="Edit"><i class="fas fa-edit"></i></a>
                            <form action="{{ url('/contact/' . $kontak->id) }}" method="POST" style="display:inline;" class="delete-form">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-sm btn-danger" title="Hapus">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </form>
                        </td>
                    </tr>
                    @endforeach
                @else
                    <tr>
                        <td colspan="4" class="text-center text-muted no-results">Belum ada kontak yang tersimpan di database.</td>
                    </tr>
                @endif
            </tbody>
        </table>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('js/kontakdb.js') }}"></script>
@endpush