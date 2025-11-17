<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BroadcastController;

Route::post('/send-watzap', [BroadcastController::class, 'sendMessage']);
