<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log; // Digunakan untuk mencatat ke log Laravel

class BroadcastController extends Controller
{
    /**
     * Menerima permintaan broadcast dari frontend dan mengirimkannya ke API Watzap.id
     * menggunakan cURL.
     */
    public function sendMessage(Request $request)
    {
        // 1. Validasi Input
        $validated = $request->validate([
            'api_key' => 'required|string',
            'message' => 'required|string',
            'phone_no' => 'required|array', // Array nomor dari frontend
            'schedule_time' => 'nullable|string', 
        ]);

        $apiKey = $validated['api_key'];
        $message = $validated['message'];
        $numbers = $validated['phone_no'];
        $scheduleTime = $validated['schedule_time'] ?? null;
        
        // PENTING: Gunakan number_key yang Anda sediakan. 
        $numberKey = 'skj8bkiF9RwjKyzb'; 

        // -------------------------------------------------------------------
        // ENDPOINT API Watzap.id
        $watzapApiUrl = 'https://api.watzap.id/v1/send_message';
        // -------------------------------------------------------------------

        $results = [];
        $hasFailed = false;
        $totalRecipients = count($numbers);

        // --- LOGGING INPUT DARI FRONTEND (LEVEL INFO) ---
        // Mencatat semua input yang diterima.
        Log::info('Broadcast Request Received (START):', [
            'api_key_sent_snippet' => substr($apiKey, 0, 8) . '...', 
            'number_key_used' => $numberKey,
            'total_recipients' => $totalRecipients,
            'recipients_list' => $numbers, // Log semua nomor yang diterima
            'schedule_time' => $scheduleTime ?? 'NOW',
            'message_snippet' => substr($message, 0, 50) . '...' // Cuplikan pesan
        ]);
        // ------------------------------------------------

        // 2. Lakukan perulangan untuk setiap nomor telepon
        foreach ($numbers as $number) {
            
            // 2.1 Bersihkan dan Format Nomor ke format internasional (628xxxx)
            $cleanNumber = preg_replace('/[^0-9]/', '', $number);
            if (substr($cleanNumber, 0, 1) === '0') {
                 $cleanNumber = '62' . substr($cleanNumber, 1);
            }
            
            // 2.2 Siapkan Data Payload (Sesuai Spesifikasi Watzap.id)
            $dataSending = [
                "api_key" => $apiKey,
                "number_key" => $numberKey, 
                "phone_no" => $cleanNumber, 
                "message" => $message,
                "wait_until_send" => "1", 
            ];

            // Tambahkan jadwal jika ada
            if (!empty($scheduleTime)) {
                // Asumsi format API Watzap adalah YYYY-MM-DD HH:MM:SS
                $dataSending['schedule_time'] = date('Y-m-d') . ' ' . $scheduleTime . ':00';
            }
            
            // --- DEBUG: LOGGING PAYLOAD SEBELUM KIRIM (LEVEL INFO) ---
            // Mengubah Log::debug menjadi Log::info agar lebih mudah terlihat di log.
            Log::info("Watzap Payload (Attempting to send to {$cleanNumber}):", $dataSending);
            // --------------------------------------------

            // 3. Eksekusi cURL
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => $watzapApiUrl,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 30, // Timeout 30 detik
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode($dataSending),
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json'
                ],
                // Pastikan SSL diaktifkan jika menggunakan HTTPS
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
            ]);
            
            $response = curl_exec($curl);
            $err = curl_error($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            curl_close($curl);
            
            // 4. Proses Hasil
            if ($err) {
                // cURL GAGAL (masalah jaringan/server)
                $hasFailed = true;
                Log::error("cURL Connection Error to {$cleanNumber}: " . $err, ['payload' => $dataSending]); 
                $results[$cleanNumber] = ['status' => 'error', 'message' => "cURL failed: {$err}"];
                
            } else {
                
                $decodedResponse = json_decode($response, true);
                
                // 4.1 Cek Kegagalan HTTP (Non-200)
                if ($httpCode !== 200) {
                    Log::warning("Watzap API returned non-200 HTTP code ({$httpCode}) for {$cleanNumber}.", ['response_body' => $response, 'payload' => $dataSending]);
                    $hasFailed = true;
                    $results[$cleanNumber] = ['status' => 'error', 'message' => "HTTP {$httpCode} from API", 'detail' => $response];
                    
                // 4.2 Cek Kegagalan Logis (Status 'error' dari JSON)
                } elseif (!isset($decodedResponse['status']) || $decodedResponse['status'] === 'error') {
                    $hasFailed = true;
                    $apiMessage = $decodedResponse['message'] ?? 'Unknown API Error';
                    // LOGGING GAGAL DARI API (LEVEL WARNING)
                    Log::warning("Watzap API failed to send to {$cleanNumber}: " . $apiMessage, ['full_response' => $decodedResponse, 'payload' => $dataSending]);
                    $results[$cleanNumber] = $decodedResponse;
                    
                // 4.3 Sukses
                } else {
                    // LOGGING SUKSES (LEVEL INFO)
                    Log::info("Watzap API Success for {$cleanNumber}:", ['full_response' => $decodedResponse]);
                    $results[$cleanNumber] = $decodedResponse;
                }
            }
        }
        
        // 5. Kembalikan Respons ke Frontend
        if ($hasFailed) {
             return response()->json([
                 'status' => 'error', 
                 'message' => 'Terdapat kegagalan pengiriman. Cek log server (`storage/logs/laravel.log`) untuk detail API.',
                 'details' => $results
            ], 500);
        }
        
        return response()->json([
            'status' => 'success', 
            'message' => "Pengiriman ke {$totalRecipients} kontak berhasil diproses.",
            'details' => $results
        ]);
    }
}
