<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class KaryawanModel extends Model
{
    protected $table = 't_karyawan';
    public $timestamps = false;
    
    // Scope yang menjalankan SELECT nama, no_hp
    public function scopeNamaHp(Builder $query): Builder
    {
        return $query->select('nama', 'no_hp');
    }
}