<?php

use App\Http\Controllers\MainController;
use App\Http\Controllers\KaryawanController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('index');
});

// Rute untuk halaman login
Route::get('/login', [MainController::class, 'login']);

// Rute untuk halaman login
Route::get('/broadcast', [MainController::class, 'broadcast']);

// Rute untuk halaman login
Route::get('/contact', [MainController::class, 'contact']);

// Rute untuk halaman login
Route::get('/kontakdb', [MainController::class, 'kontakdb']);

// Rute untuk halaman login
Route::get('/config', [MainController::class, 'config']);


Route::get('/daftar-karyawan', [KaryawanController::class, 'daftarKaryawan']);

Route::get('/check-db', function () {
    return [
        'connection' => config('database.default'),
        'host' => config('database.connections.mysql.host'),
        'database' => config('database.connections.mysql.database'),
        'username' => config('database.connections.mysql.username'),
    ];
});



