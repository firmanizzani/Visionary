# AI AGENT DEVELOPMENT PROMPT
# VISIONARY AI — INTELLIGENT OBJECT DETECTION PLATFORM

## ROLE & OBJECTIVE

Bertindaklah sebagai Senior Full-Stack Software Engineer, Machine Learning Engineer, Computer Vision Engineer, UI/UX Designer, dan Software Architect.

Tugas utama kamu adalah membangun aplikasi web bernama **Visionary AI — Intelligent Object Detection Platform** secara lengkap, modern, responsif, fungsional, dan terintegrasi end-to-end.

Visionary AI adalah platform berbasis Computer Vision yang dapat mengenali berbagai objek secara real-time melalui kamera perangkat maupun gambar yang diunggah pengguna. Sistem juga menyediakan Object Segmentation, Smart Object Counting, Confidence Score, autentikasi, penyimpanan hasil deteksi, riwayat, dashboard, dan analytics.

Project ini harus menggunakan model Deep Learning YOLO yang berjalan langsung di browser melalui ONNX Runtime Web, sehingga tidak membutuhkan server AI inference berbayar.

Jangan hanya membuat landing page, static prototype, atau fitur dengan mock data. Implementasikan seluruh fitur sesuai spesifikasi, termasuk frontend, backend, database, penyimpanan gambar, dan integrasi model AI.

## 1. FINAL TECHNOLOGY STACK

### Frontend
- SvelteKit
- TypeScript
- Tailwind CSS
- shadcn-svelte
- Lucide Icons
- Chart library yang kompatibel dengan Svelte

### Backend
- Python
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic

### Database
- Neon PostgreSQL

### Authentication
- JWT-based authentication
- Secure password hashing menggunakan Argon2id
- Secure session management

### Image Storage
- Cloudinary dengan akses gambar privat

### Deep Learning Development
- Python
- PyTorch
- Ultralytics YOLO Segmentation

### AI Production Runtime
- ONNX Runtime Web
- ONNX model hasil ekspor dari YOLO Segmentation
- WebGPU apabila kompatibel
- WebAssembly (WASM) sebagai fallback

### Deployment
- Frontend: Vercel
- Backend FastAPI: Vercel
- Database: Neon
- Image Storage: Cloudinary

### Constraints
- Tidak menggunakan Docker.
- Tidak menggunakan OpenAI API, Gemini API, atau API AI eksternal.
- Tidak menggunakan Object Tracking.
- Tidak membuat sistem pembayaran.
- Tidak menggunakan Supabase.
- Tidak menjalankan PyTorch atau YOLO inference di FastAPI production.
- Tidak menggunakan WebSocket untuk mengirim frame kamera ke backend.
- Tidak menggunakan mock data sebagai implementasi akhir.
- Jangan mengganti technology stack tanpa alasan kompatibilitas yang jelas.
- Jangan menghapus fitur hanya untuk menyederhanakan implementasi.

## 2. SYSTEM ARCHITECTURE

Implementasikan dua lapisan utama.

### A. Client-Side AI Inference

Frontend menjalankan seluruh proses Computer Vision.

Alur:

Camera / Uploaded Image → Image Preprocessing → YOLO ONNX Inference → Output Postprocessing → Bounding Box / Segmentation Mask → Object Counting → UI Rendering.

Model ONNX dijalankan menggunakan ONNX Runtime Web di browser.

Frame kamera tidak dikirim ke backend untuk inference.

Proses inference harus dijalankan secara asynchronous dan tidak boleh memblokir UI. Gunakan Web Worker apabila kompatibel dengan runtime, model, dan execution provider yang dipilih.

### B. Backend Application Services

FastAPI bertanggung jawab atas:

- Register dan Login.
- Authentication dan Authorization.
- Session Management.
- User Profile.
- User Settings.
- Detection History.
- Detection Metadata.
- Dashboard Statistics.
- Detection Analytics.
- Cloudinary Integration.
- Penghapusan history dan file terkait.

FastAPI tidak membutuhkan PyTorch, Ultralytics, atau bobot model YOLO dalam environment production.

## 3. APPLICATION PAGES

### Public Pages

1. Landing Page
2. Login
3. Register

### Authenticated Pages

1. Dashboard
2. Live Detection
3. Image Detection
4. Detection History
5. Detection Detail
6. Analytics
7. Profile & Settings

Guest dapat mencoba fitur deteksi tanpa akun, tetapi harus login untuk menyimpan history.

## 4. DESIGN REQUIREMENTS

Buat UI/UX dengan kualitas visual aplikasi AI SaaS modern dan profesional.

### Design Direction

- Clean, premium, modern, dan minimalis.
- Visual hierarchy yang kuat.
- Layout yang lega dan seimbang.
- Subtle gradients.
- Rounded components yang konsisten.
- Typography modern.
- Icons yang relevan.
- Smooth transitions.
- Interactive states yang jelas.
- Tidak menggunakan desain template generik.

### Suggested Design System

Primary: Deep Navy atau Dark Slate.

Accent: Cyan, Teal, atau Electric Blue.

Background: Neutral surfaces dengan kontras yang baik.

Gunakan palet warna secara konsisten pada seluruh halaman.

### Landing Page

Buat landing page yang terlihat seperti produk teknologi nyata, bukan template sederhana.

Section:
- Navbar.
- Hero dengan headline kuat.
- Interactive AI detection preview.
- Key Features.
- How It Works.
- Computer Vision Technology.
- Product Benefits.
- Final CTA.
- Footer.

Preview AI boleh menggunakan ilustrasi atau contoh visual yang ditandai sebagai demo. Jangan menyajikan prediksi palsu sebagai hasil live inference.

### Dashboard Layout

Desktop:
- Sidebar kiri.
- Main content kanan.
- Summary cards.
- Recent detections.
- Activity overview.
- Quick actions.

Mobile:
- Sidebar menjadi drawer atau navigasi responsif.
- Konten disusun vertikal.
- Tombol utama mudah dijangkau.

Jangan membuat semua halaman terasa penuh dengan kartu statistik.

Prioritaskan fungsi halaman masing-masing.

## 5. AUTHENTICATION

Implementasikan:

- Register.
- Login.
- Logout.
- Protected routes.
- Session expiration handling.
- Change Password.
- Profile Update.

Field registrasi:
- Full Name.
- Email.
- Password.
- Confirm Password.

Password minimal delapan karakter dan harus disimpan menggunakan hashing yang aman.

Gunakan access token dengan masa berlaku pendek serta mekanisme refresh session yang aman.

Untuk aplikasi web, prioritaskan cookie HttpOnly, Secure, SameSite, dan perlindungan CSRF yang sesuai.

Jangan menyimpan JWT jangka panjang di localStorage.

Setiap endpoint privat harus memvalidasi autentikasi dan kepemilikan data.

## 6. LIVE OBJECT DETECTION

Halaman ini adalah fitur utama Visionary AI.

### Camera Features

- Request Camera Permission.
- Start Camera.
- Stop Camera.
- Switch Camera.
- Live Camera Preview.
- Live AI Detection Overlay.
- Bounding Box.
- Segmentation Mask.
- Object Labels.
- Confidence Score.
- Real-Time Object Counting.
- Confidence Threshold.
- Save Detection.

Setelah kamera aktif dan model siap, inference berjalan otomatis.

### Model Loading

- Muat model ONNX secara lazy ketika fitur deteksi dibuka.
- Tampilkan loading progress atau status pemuatan.
- Hindari memuat model ulang saat berpindah mode visualisasi.
- Cache model menggunakan mekanisme browser yang sesuai.
- Tangani kegagalan download dan inisialisasi model.

### Real-Time Performance

- Jalankan inference menggunakan mekanisme yang tidak mengunci UI.
- Terapkan pembatasan resolusi dan frekuensi inference.
- Jangan menjalankan beberapa inference secara bersamaan pada model yang sama tanpa pengelolaan antrean.
- Lewati frame usang.
- Gunakan requestAnimationFrame untuk rendering overlay yang sesuai.
- Sediakan fallback WASM jika WebGPU tidak tersedia atau gagal.
- Perhatikan kompatibilitas Safari iOS.

Kamera harus tetap responsif meskipun inference berjalan lebih lambat daripada frame rate video.

## 7. IMAGE DETECTION

Sediakan halaman terpisah untuk mendeteksi objek dari gambar.

Fitur:
- Drag and Drop.
- Upload JPG, JPEG, PNG, dan WebP.
- Image Preview.
- Detect Objects.
- Bounding Box.
- Segmentation Mask.
- Detected Objects List.
- Object Counting.
- Confidence Threshold.
- Save Detection.
- Remove / Replace Image.

Maksimal file awal: 10 MB.

Proses inference dilakukan langsung di browser menggunakan model ONNX yang sama dengan Live Detection.

Jangan mengunggah gambar ke backend hanya untuk melakukan prediksi.

## 8. YOLO ONNX INTEGRATION

Gunakan model Ultralytics YOLO Instance Segmentation yang benar-benar mendukung ekspor ONNX dan dapat dijalankan menggunakan ONNX Runtime Web.

### Model Development

Siapkan direktori khusus untuk:

- Model preparation.
- Optional fine-tuning.
- Model evaluation.
- ONNX export.
- Model metadata.
- Class labels.

Gunakan Python + PyTorch + Ultralytics hanya pada development workflow.

### Model Export

Export model ke format `.onnx`.

Pastikan:
- Input shape sesuai runtime.
- Output detection sesuai arsitektur model.
- Output segmentation prototype tersedia.
- Operator ONNX didukung runtime browser.
- Model dapat diuji menggunakan ONNX Runtime sebelum diintegrasikan.

### Browser Preprocessing

Implementasikan:
- Image orientation handling.
- Letterbox resizing.
- RGB conversion.
- Normalization.
- Tensor construction.
- Dimension mapping.

### Browser Postprocessing

Implementasikan berdasarkan output model yang benar-benar dipilih:

- Confidence filtering.
- Class prediction.
- Non-Maximum Suppression jika diperlukan oleh output ekspor.
- Bounding box decoding.
- Coordinate rescaling.
- Segmentation coefficient processing.
- Prototype mask reconstruction.
- Mask cropping.
- Mask scaling.
- Polygon atau mask rendering.

Jangan berasumsi seluruh versi YOLO memiliki bentuk output tensor yang identik.

### Model Testing

Bandingkan hasil inference ONNX dengan hasil model PyTorch pada beberapa gambar uji yang sama.

Pastikan jumlah, label, posisi objek, dan hasil segmentasi cukup konsisten.

## 9. DETECTION VISUALIZATION

Sediakan tiga pilihan mode:

1. Bounding Box.
2. Segmentation Mask.
3. Both.

### Bounding Box

- Posisi mengikuti objek.
- Label jelas.
- Confidence ditampilkan jika pengaturan aktif.
- Scaling sesuai camera viewport.
- Overlay tidak menutupi kontrol utama.

### Segmentation Mask

- Mask mengikuti bentuk objek.
- Gunakan transparansi.
- Warna mudah dibedakan.
- Mask tetap sejajar saat viewport berubah.

Jika model tidak menghasilkan mask valid, tampilkan bounding box yang tersedia serta pesan yang sesuai tanpa mengarang hasil segmentasi.

## 10. SMART OBJECT COUNTING

Hitung objek berdasarkan kategori dari hasil deteksi per frame.

Contoh:

- Chair: 3
- Bottle: 2
- Laptop: 1

Counting:
- Berdasarkan hasil inference aktual.
- Mengikuti confidence threshold.
- Mengelompokkan label yang sama.
- Diperbarui ketika frame berubah.
- Tidak menggunakan Object Tracking.
- Tidak menghitung objek unik sepanjang sesi.

Tampilkan jumlah total dan daftar kategori yang terdeteksi.

## 11. SAVE DETECTION

Fitur hanya tersedia untuk authenticated user.

### Live Camera

Ketika Save Detection ditekan:
- Ambil snapshot dari frame yang hasil prediksinya sedang ditampilkan.
- Pastikan gambar dan metadata prediksi berasal dari frame yang sama.
- Simpan gambar melalui Cloudinary.
- Simpan metadata melalui FastAPI ke Neon.
- Tampilkan notifikasi sukses setelah penyimpanan selesai.

### Uploaded Image

- Gunakan gambar yang dipilih pengguna.
- Simpan prediksi dari inference yang bersangkutan.
- Jangan menjalankan inference ulang tanpa kebutuhan.

### Data Saved

- User ID.
- Detection ID.
- Source Type.
- Image Storage Identifier.
- Timestamp.
- Model Version.
- Confidence Threshold.
- Total Objects.
- Object Labels.
- Confidence Scores.
- Bounding Boxes.
- Segmentation Data.

### Security & Consistency

Hasil prediksi dari browser merupakan data yang dikirim client dan tidak boleh dianggap sebagai hasil yang telah diverifikasi server.

Validasi struktur dan batas ukuran data sebelum menyimpan.

Jangan mengandalkan metadata dari client untuk keputusan keamanan.

Gunakan idempotency key atau mekanisme setara agar klik Save berulang tidak membuat duplikasi.

Jika penyimpanan database gagal setelah file terunggah, lakukan cleanup file atau rekonsiliasi yang aman.

## 12. DETECTION HISTORY

Tampilkan seluruh hasil pemindaian yang disimpan pengguna.

History harus menyediakan:
- Thumbnail.
- Tanggal.
- Source Type.
- Total Objects.
- Object Labels.
- Search.
- Filter.
- Pagination.
- View Detail.
- Delete.

Urutkan berdasarkan waktu terbaru.

Tampilkan empty state untuk pengguna tanpa riwayat.

## 13. DETECTION DETAIL

Tampilkan:
- Saved Image.
- Date & Time.
- Source Type.
- Model Version.
- Total Objects.
- Detected Objects List.
- Confidence.
- Bounding Boxes.
- Segmentation Masks.
- Delete Detection.

Rekonstruksi overlay dari metadata yang tersimpan.

Jangan menjalankan ulang model hanya untuk membuka detail history.

Pastikan koordinat dan segmentasi tetap cocok dengan resolusi gambar yang tersimpan.

## 14. DASHBOARD

Summary cards:
- Total Saved Detections.
- Total Objects Detected.
- Unique Object Categories.
- Most Detected Object.

Additional content:
- Recent Detections.
- Detection Activity Preview.
- Quick Actions.

Semua informasi harus berasal dari Neon PostgreSQL.

Jika akun belum memiliki data, tampilkan empty state yang relevan.

## 15. ANALYTICS

Fitur:
- Total Detections.
- Total Objects.
- Unique Categories.
- Average Confidence.
- Detection Activity Chart.
- Top Detected Objects.
- Object Category Distribution.
- Detection Source Comparison.

Filter periode:
- Last 7 Days.
- Last 30 Days.
- Last 90 Days.
- All Time.

Analytics menggunakan riwayat yang disimpan pengguna, bukan seluruh frame kamera.

## 16. PROFILE & SETTINGS

Profile:
- Full Name.
- Email.
- Account Creation Date.
- Edit Profile.
- Change Password.

Detection Settings:
- Default Confidence Threshold.
- Default Visualization Mode.
- Show Confidence Labels.
- Preferred Camera jika tersedia.

Pengaturan pengguna login harus tersimpan ke Neon.

## 17. DATABASE DESIGN

Gunakan Neon PostgreSQL.

### `users`

- id UUID PRIMARY KEY
- full_name VARCHAR
- email VARCHAR UNIQUE
- password_hash VARCHAR
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ

### `detections`

- id UUID PRIMARY KEY
- user_id UUID FOREIGN KEY
- source_type VARCHAR
- image_public_id VARCHAR
- model_version VARCHAR
- confidence_threshold FLOAT
- total_objects INTEGER
- detected_at TIMESTAMPTZ
- created_at TIMESTAMPTZ

### `detected_objects`

- id UUID PRIMARY KEY
- detection_id UUID FOREIGN KEY
- class_id INTEGER
- object_name VARCHAR
- confidence FLOAT
- bounding_box JSONB
- segmentation_data JSONB
- created_at TIMESTAMPTZ

### `user_settings`

- id UUID PRIMARY KEY
- user_id UUID UNIQUE FOREIGN KEY
- confidence_threshold FLOAT
- visualization_mode VARCHAR
- show_confidence BOOLEAN
- preferred_camera VARCHAR NULL
- updated_at TIMESTAMPTZ

Gunakan migrations Alembic.

Terapkan foreign keys, constraints, indexing, dan ownership authorization.

## 18. BACKEND API

Prefix: `/api/v1`

### Auth
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/logout`
- POST `/auth/refresh`
- GET `/auth/me`
- PATCH `/auth/password`

### User
- GET `/users/me`
- PATCH `/users/me`
- GET `/users/settings`
- PATCH `/users/settings`

### Detection History
- POST `/detections`
- GET `/detections`
- GET `/detections/{id}`
- DELETE `/detections/{id}`

### Dashboard
- GET `/dashboard/overview`

### Analytics
- GET `/analytics/summary`
- GET `/analytics/activity`
- GET `/analytics/objects`
- GET `/analytics/sources`

Backend juga harus menyediakan mekanisme aman untuk upload gambar Cloudinary dan akses gambar privat.

Jangan menyediakan endpoint server-side inference di production.

## 19. CLOUDINARY INTEGRATION

Gunakan Cloudinary untuk menyimpan foto history.

Ketentuan:
- Foto tidak diunggah otomatis dari live stream.
- Gunakan private/authenticated delivery.
- Credential hanya tersedia di server.
- Gunakan signed upload atau mekanisme upload aman yang kompatibel dengan batas Vercel Functions.
- Simpan storage identifier di Neon.
- Gunakan signed delivery sesuai otorisasi akun.
- Hapus file ketika history dihapus.
- Kompres gambar secara wajar sebelum upload.
- Batasi format dan ukuran.
- Jangan mengandalkan URL publik permanen.

## 20. REPOSITORY STRUCTURE

Gunakan satu repository dengan pemisahan berikut:

visionary-ai/
- frontend/
- backend/
- ml/
- docs/

Frontend berisi aplikasi SvelteKit.

Backend berisi FastAPI, database models, schemas, services, authentication, storage, dan API routes.

ML berisi model preparation, export, evaluation scripts, dan dokumentasi.

Dokumentasikan asal bobot model, lisensi, kelas objek, versi, dan langkah reproduksi ekspor.

Bobot PyTorch dan dataset besar tidak perlu dimasukkan ke deployment backend.

File ONNX production harus tersedia melalui aset statis atau CDN yang kompatibel dengan aplikasi.

## 21. ENVIRONMENT CONFIGURATION

Sediakan `.env.example` tanpa secret asli.

Contoh variabel backend:
- DATABASE_URL
- JWT_SECRET_KEY
- ACCESS_TOKEN_EXPIRE_MINUTES
- REFRESH_TOKEN_EXPIRE_DAYS
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- FRONTEND_URL

Contoh frontend:
- PUBLIC_API_BASE_URL
- PUBLIC_MODEL_URL
- PUBLIC_MODEL_VERSION

Jangan memasukkan database credential, JWT secret, atau Cloudinary API secret dalam variabel publik frontend.

## 22. DEPLOYMENT REQUIREMENTS

### Frontend

Deploy SvelteKit melalui Vercel.

Pastikan:
- Model ONNX dapat diunduh.
- MIME type dan caching aset model sesuai.
- Camera permission bekerja melalui HTTPS.
- Browser inference berjalan pada production build.

### Backend

Deploy FastAPI melalui Vercel Python runtime.

Pastikan:
- Tidak ada dependency PyTorch pada production.
- Database connection dikelola dengan baik.
- Migrations dijalankan secara terkontrol.
- Semua environment variables terpasang.
- CORS dan cookie authentication sesuai konfigurasi domain.

### Important

Jangan mengasumsikan deployment gratis berarti memiliki sumber daya tanpa batas.

Periksa batas paket Vercel, Neon, dan Cloudinary serta ukuran model ONNX.

## 23. PERFORMANCE & COMPATIBILITY

Optimalkan untuk:
- Desktop Chrome.
- Desktop Edge.
- Android Chrome.
- iPhone Safari.

Gunakan fallback apabila WebGPU tidak tersedia.

Tampilkan status ketika perangkat tidak mendukung model atau browser runtime.

Jangan mengklaim semua perangkat mampu mencapai frame rate yang sama.

Prioritaskan:
- Kamera tetap responsif.
- UI tidak freeze.
- Hasil deteksi tetap akurat.
- Beban memori terkendali.
- Model tidak dimuat berulang.

## 24. TESTING REQUIREMENTS

Implementasikan dan jalankan pengujian untuk:

### Frontend
- Camera permission.
- Responsive layout.
- Upload validation.
- Overlay coordinate mapping.
- Mode switching.
- Loading dan error states.

### Backend
- Register/Login.
- JWT authorization.
- User ownership.
- History CRUD.
- Database integration.
- Storage integration.

### AI
- ONNX model loading.
- Preprocessing.
- Output decoding.
- Segmentation reconstruction.
- Counting.
- Confidence threshold.
- Perbandingan hasil ONNX dengan PyTorch.

### End-to-End
- Register.
- Login.
- Live Detection.
- Save Detection.
- View History.
- View Detection Detail.
- Analytics Update.
- Delete History.
- Logout.

## 25. DEVELOPMENT EXECUTION RULES

Kerjakan seluruh fitur dalam scope secara bertahap sampai aplikasi terintegrasi.

Urutan implementasi:

1. Setup repository dan arsitektur.
2. Implementasi design system dan halaman.
3. Setup FastAPI, Neon, SQLAlchemy, Alembic.
4. Implementasi autentikasi.
5. Persiapan dan ekspor YOLO ONNX.
6. Implementasi ONNX Runtime Web.
7. Implementasi Live Detection.
8. Implementasi Image Detection.
9. Implementasi Segmentation dan Smart Counting.
10. Implementasi Cloudinary dan Save Detection.
11. Implementasi History dan Detail.
12. Implementasi Dashboard dan Analytics.
13. Implementasi Profile & Settings.
14. Testing, optimization, dan deployment configuration.

Setiap fitur harus benar-benar terhubung dengan sistem yang sesuai.

Jangan membuat data statistik palsu, tombol tanpa fungsi, halaman kosong, atau menyatakan fitur selesai sebelum implementasi dan pengujiannya dilakukan.

Jika credential eksternal belum tersedia, siapkan konfigurasi dan dokumentasi setup yang jelas tanpa membuat credential fiktif. Bedakan pekerjaan yang sudah teruji dari pekerjaan yang masih memerlukan layanan eksternal.

## FINAL EXPECTED RESULT

Bangun Visionary AI sebagai aplikasi Full-Stack Computer Vision yang modern, lengkap, dan siap untuk proses deployment.

Aplikasi harus dapat:

- Mengenali objek secara langsung melalui kamera.
- Mendeteksi objek melalui gambar yang diunggah.
- Menampilkan Bounding Box dan Segmentation Mask.
- Menghitung objek secara otomatis.
- Mengelola akun pengguna.
- Menyimpan foto hasil scan secara privat.
- Menampilkan history dan analytics yang menggunakan data nyata.
- Menjalankan Deep Learning di browser tanpa API AI berbayar.

Fokus pada kualitas engineering, performa, akurasi model, keamanan data, pengalaman pengguna, dan desain UI/UX yang profesional.

Jadikan PRD Visionary AI v2.0 sebagai sumber utama kebutuhan fungsional dan acceptance criteria.
