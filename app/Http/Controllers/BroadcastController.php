<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log; // Digunakan untuk mencatat ke log Laravel

class BroadcastController extends Controller
{
    /**
     * Menerima permintaan broadcast dari frontend dan mengirimkannya ke API Watzap.id
     * menggunakan cURL. (Mendukung Teks, Gambar URL, dan File URL)
     */
    public function sendMessage(Request $request)
    {
        // 1. Validasi Input
        $validated = $request->validate([
            'api_key' => 'required|string',
            'phone_no' => 'required|array', 
            'content_type' => 'required|in:text,image,file', // Tipe konten baru
            
            // Input opsional untuk Teks
            'message' => 'nullable|string', 

            // Input opsional untuk Media
            'file_url' => 'nullable|url', 
            'caption' => 'nullable|string', 
            'filename' => 'nullable|string', 

            // Input Jadwal
            'schedule_time' => 'nullable|string', 
            'schedule_date' => 'nullable|string', // Digunakan untuk pengiriman Once
        ]);

        $apiKey = $validated['api_key'];
        $numbers = $validated['phone_no'];
        $contentType = $validated['content_type'];
        $scheduleTime = $validated['schedule_time'] ?? null;
        $scheduleDate = $validated['schedule_date'] ?? null;

        // PENTING: Gunakan number_key yang terbukti benar untuk lisensi ini
        $numberKey = 'skj8bkiF9RwjKyzb'; 

        $results = [];
        $hasFailed = false;
        $totalRecipients = count($numbers);
        $messageSnippet = ($contentType === 'text') ? substr($request->input('message'), 0, 50) . '...' : "Media ({$contentType}) URL: " . substr($request->input('file_url'), 0, 50) . '...';
        
        // --- LOGGING INPUT DARI FRONTEND (LEVEL INFO) ---
        Log::info('Broadcast Request Received (START):', [
            'content_type' => $contentType,
            'api_key_sent_snippet' => substr($apiKey, 0, 8) . '...', 
            'number_key_used' => $numberKey,
            'total_recipients' => $totalRecipients,
            'schedule_time' => $scheduleTime ? ($scheduleDate . ' ' . $scheduleTime) : 'NOW',
            'content_snippet' => $messageSnippet
        ]);
        // ------------------------------------------------

        // 2. Lakukan perulangan untuk setiap nomor telepon
        foreach ($numbers as $number) {
            
            // 2.1 Bersihkan dan Format Nomor ke format internasional (628xxxx)
            $cleanNumber = preg_replace('/[^0-9]/', '', $number);
            if (substr($cleanNumber, 0, 1) === '0') {
                 $cleanNumber = '62' . substr($cleanNumber, 1);
            }
            
            // 2.2 Tentukan Endpoint dan Payload berdasarkan Content Type
            // Inisialisasi payload hanya dengan API key, number key, dan phone no
            $dataSending = [
                "api_key" => $apiKey,
                "number_key" => $numberKey, 
                "phone_no" => $cleanNumber, 
            ];
            $watzapApiUrl = '';
            $typeForLog = '';

            if ($contentType === 'text') {
                $watzapApiUrl = 'https://api.watzap.id/v1/send_message';
                $dataSending['message'] = $request->input('message');
                $dataSending["wait_until_send"] = "1";
                $typeForLog = 'text';
                
            } elseif ($contentType === 'image') {
                $watzapApiUrl = 'https://api.watzap.id/v1/send_image_url';
                $dataSending['url'] = $validated['file_url'];
                $dataSending['message'] = $validated['caption'] ?? '';
                // 0 untuk caption terpisah, 1 untuk caption digabung
                $dataSending['separate_caption'] = (empty($validated['caption'])) ? "1" : "0"; 
                $dataSending["wait_until_send"] = "1";
                $typeForLog = 'image';

            } elseif ($contentType === 'file') {
                $caption = $validated['caption'] ?? '';
                $fileUrl = $validated['file_url'];

                // --- PENGIRIMAN 1 (TEKS CAPTION) ---
                if (!empty($caption)) {
                    $textPayload = [
                        "api_key" => $apiKey,
                        "number_key" => $numberKey, 
                        "phone_no" => $cleanNumber, 
                        "message" => $caption,
                        "wait_until_send" => "1",
                    ];
                    
                    // Panggil Helper untuk pengiriman teks/caption terpisah
                    // Hasilnya diabaikan dari $results utama, tapi dicatat di log
                    $this->executeCurl('https://api.watzap.id/v1/send_message', $textPayload, $cleanNumber, 'text_caption');
                }
                // ---------------------------------------------


                // --- PENGIRIMAN 2 (FILE) ---
                $watzapApiUrl = 'https://api.watzap.id/v1/send_file_url';
                $dataSending['url'] = $fileUrl; // Payload minimal untuk file
                $typeForLog = 'file_only';
            }
            
            // Tambahkan jadwal jika ada
            if (!empty($scheduleTime)) {
                if (!empty($scheduleDate)) {
                     // Mode Once (Tanggal & Jam)
                    $dataSending['schedule_time'] = $scheduleDate . ' ' . $scheduleTime . ':00';
                } else {
                    // Mode Daily (Jam saja)
                    $dataSending['schedule_time'] = $scheduleTime . ':00';
                }
            }
            
            // --- DEBUG: LOGGING PAYLOAD SEBELUM KIRIM (LEVEL INFO) ---
            Log::info("Watzap Payload ({$contentType} to {$cleanNumber}):", $dataSending);
            // --------------------------------------------

            // 3. Eksekusi cURL dengan Helper (Menggantikan seluruh blok cURL lama)
            $decodedResponse = $this->executeCurl($watzapApiUrl, $dataSending, $cleanNumber, $typeForLog);
            
            // 4. Proses Hasil (Menggunakan hasil dari Helper)
            // Jika pengiriman file utama gagal, catat kegagalan
            if (isset($decodedResponse['status']) && $decodedResponse['status'] === 'error') {
                $hasFailed = true;
                $results[$cleanNumber] = $decodedResponse;
            } else {
                $results[$cleanNumber] = $decodedResponse;
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
            'message' => "Pengiriman {$contentType} ke {$totalRecipients} kontak berhasil diproses.",
            'details' => $results
        ]);
    }
    
    // --- FUNGSI HELPER BARU UNTUK EKSEKUSI cURL ---
    private function executeCurl($url, $payload, $number, $type = 'file_or_media')
    {
        // PENTING: Gunakan number_key yang terbukti benar untuk lisensi ini
        // (Diambil dari $numberKey di dalam sendMessage)
        $numberKey = 'skj8bkiF9RwjKyzb'; 

        $curl = curl_init();
        
        // Cek jika payload tidak memiliki number_key, tambahkan
        if (!isset($payload['number_key'])) {
            $payload['number_key'] = $numberKey;
        }

        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json'
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);
        
        $response = curl_exec($curl);
        $err = curl_error($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        
        // Logika sederhana untuk logging hasil helper
        if ($err) {
            Log::error("cURL Connection Error for {$type} to {$number}: " . $err, ['payload' => $payload]); 
            return ['status' => 'error', 'message' => "cURL failed: {$err}"];
        }
        
        $decodedResponse = json_decode($response, true);
        
        if ($httpCode !== 200 || (isset($decodedResponse['status']) && ($decodedResponse['status'] === 'error' || $decodedResponse['status'] === '1003'))) {
            $apiMessage = $decodedResponse['message'] ?? 'Unknown API Error';
            Log::warning("Watzap API failed to send {$type} to {$number} (HTTP {$httpCode}): " . $apiMessage, ['full_response' => $decodedResponse, 'payload' => $payload]);
            return ['status' => 'error', 'message' => $apiMessage, 'full_response' => $decodedResponse];
        }
        
        Log::info("Watzap API Success for {$type} to {$number}:", ['full_response' => $decodedResponse]);
        return $decodedResponse;
    }
}