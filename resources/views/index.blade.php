@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
<body class="sb-nav-fixed">
    <div class="container-fluid">
                    <h1 class="mt-4">Dashboard</h1>
                    <div class="row mt-4">
                        <div class="col-xl-6">
                            <div class="card mb-4">
                                <div class="card-header">
                                    <i class="fas fa-chart-area me-1"></i>
                                    Jumlah Aktifitas Per Hari
                                </div>
                                <div class="card-body"><canvas id="myAreaChart" width="100%" height="40"></canvas></div>
                            </div>
                        </div>
                        <div class="col-xl-6">
                            <div class="card mb-4">
                                <div class="card-header">
                                    <i class="fas fa-chart-bar me-1"></i>
                                    Jumlah Aktifitas Per Bulan
                                </div>
                                <div class="card-body"><canvas id="myBarChart" width="100%" height="40"></canvas></div>
                            </div>
                        </div>
                    </div>
                    <div class="card mb-4">
                        <div class="card-header">
                            <i class="fas fa-table me-1"></i>
                            Daftar Aktifitas
                        </div>
                        <div class="card-body">
                            <table id="datatablesSimple">
                                <thead>
                                    <tr>
                                        <th>Nama Aktifitas</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tfoot>
                                    <tr>
                                        <th>Nama Aktifitas</th>
                                        <th>Status</th>
                                    </tr>
                                </tfoot>
                                <tbody>
                                    <tr>
                                        <td>Meeting dengan Klien</td>
                                        <td>Aktif</td>
                                    </tr>
                                    <tr>
                                        <td>Review Laporan Keuangan</td>
                                        <td>Aktif</td>
                                    </tr>
                                    <tr>
                                        <td>Training Karyawan Baru</td>
                                        <td>Non-Aktif</td>
                                    </tr>
                                    <tr>
                                        <td>Update Website Perusahaan</td>
                                        <td>Aktif</td>
                                    </tr>
                                    <tr>
                                        <td>Audit Internal</td>
                                        <td>Non-Aktif</td>
                                    </tr>
                                    <tr>
                                        <td>Pengadaan Peralatan Kantor</td>
                                        <td>Aktif</td>
                                    </tr>
                                    <tr>
                                        <td>Evaluasi Kinerja Bulanan</td>
                                        <td>Aktif</td>
                                    </tr>
                                    <tr>
                                        <td>Perencanaan Anggaran Tahunan</td>
                                        <td>Non-Aktif</td>
                                    </tr>
                                    <tr>
                                        <td>Pembukaan Posisi Pekerjaan Baru</td>
                                        <td>Aktif</td>
                                    </tr>
                                    <tr>
                                        <td>Pengiriman Laporan Mingguan</td>
                                        <td>Aktif</td>
                                    </tr>
                                    <tr>
                                        <td>Penyusunan Strategi Pemasaran</td>
                                        <td>Aktif</td>
                                    </tr>
                                    <tr>
                                        <td>Diskusi Proyek Pengembangan Produk</td>
                                        <td>Aktif</td>
                                    </tr>
                                    <tr>
                                        <td>Penyelesaian Masalah IT</td>
                                        <td>Aktif</td>
                                    </tr>
                                    <tr>
                                        <td>Pengaturan Jadwal Karyawan</td>
                                        <td>Aktif</td>
                                    </tr>
                                    <tr>
                                        <td>Perencanaan Kampanye Iklan</td>
                                        <td>Non-Aktif</td>
                                    </tr>
                                    <tr>
                                        <td>Pengaturan Ruang Kantor</td>
                                        <td>Aktif</td>
                                    </tr>
                                    <tr>
                                        <td>Evaluasi Kebutuhan Sumber Daya Manusia</td>
                                        <td>Non-Aktif</td>
                                    </tr>
                                    <tr>
                                        <td>Pembayaran Tagihan dan Pajak</td>
                                        <td>Aktif</td>
                                    </tr>
                                    <tr>
                                        <td>Pengelolaan Proyek Pengembangan</td>
                                        <td>Aktif</td>
                                    </tr>
                                    <tr>
                                        <td>Pengelolaan Inventaris Kantor</td>
                                        <td>Aktif</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    <script src="{{ asset('js/scripts.js') }}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.min.js" crossorigin="anonymous"></script>
    <script src="{{ asset('assets/demo/chart-area-demo.js') }}"></script>
    <script src="{{ asset('assets/demo/chart-bar-demo.js') }}"></script>
    <script src="https://cdn.jsdelivr.net/npm/simple-datatables@7.1.2/dist/umd/simple-datatables.min.js" crossorigin="anonymous"></script>
    <script src="{{ asset('js/datatables-simple-demo.js') }}"></script>
</body>
@endsection