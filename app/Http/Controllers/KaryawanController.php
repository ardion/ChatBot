<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KaryawanController extends Controller
{
    public function daftarKaryawan()
    {
        try {
            // Coba ambil semua data dari tabel karyawan
            $karyawan = DB::table('t_karyawan')->get();

            return response()->json([
                'status' => 'success',
                'data' => $karyawan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }
}