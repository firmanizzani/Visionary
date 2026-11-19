# PRODUCT REQUIREMENTS DOCUMENT
# VISIONARY AI
**Intelligent Object Detection Platform**

**Version:** 2.0  
**Date:** 19 November 2026  
**Platform:** Responsive Web Application  
**Category:** Artificial Intelligence / Deep Learning / Computer Vision  
**Development Scope:** Full Application v1.0  
**Architecture:** Browser-Based AI Inference

---

## 1. Product Overview

### 1.1 Product Description

Visionary AI adalah aplikasi web berbasis Computer Vision yang memungkinkan pengguna mendeteksi, mengenali, menghitung, dan melakukan segmentasi berbagai objek secara otomatis menggunakan kamera perangkat maupun gambar yang diunggah.

Sistem menggunakan model YOLO Instance Segmentation yang dikembangkan dengan ekosistem Python dan PyTorch, kemudian diekspor ke format ONNX untuk menjalankan inference langsung di browser menggunakan ONNX Runtime Web.

Dengan pendekatan ini, pengguna dapat melakukan deteksi tanpa mengirimkan setiap frame kamera ke server.

Selain kemampuan deteksi, aplikasi menyediakan sistem autentikasi, dashboard, penyimpanan hasil pemindaian, riwayat deteksi, dan analitik berdasarkan aktivitas pengguna.

### 1.2 Problem Statement

Pemanfaatan teknologi Computer Vision sering kali membutuhkan konfigurasi teknis, pemahaman Machine Learning, atau perangkat lunak khusus.

Bagi pengguna umum, proses identifikasi objek melalui model Deep Learning belum tentu mudah diakses. Selain itu, aplikasi demonstrasi object detection sering tidak menyediakan sistem pengelolaan hasil yang terintegrasi.

Visionary AI bertujuan menyederhanakan akses terhadap teknologi pengenalan objek melalui aplikasi web yang mudah digunakan, interaktif, serta dilengkapi manajemen data dan visualisasi hasil.

### 1.3 Product Goals

1. Menyediakan deteksi objek langsung melalui kamera.
2. Mendukung analisis gambar yang diunggah.
3. Menghasilkan visualisasi bounding box dan segmentation mask.
4. Menghitung jumlah objek yang terdeteksi.
5. Menjalankan AI inference secara lokal di browser.
6. Menyediakan autentikasi dan pengelolaan akun.
7. Menyediakan riwayat pemindaian yang persisten.
8. Menampilkan analitik berdasarkan hasil yang disimpan.
9. Mendukung penggunaan pada desktop dan mobile.
10. Memungkinkan deployment tanpa layanan AI inference eksternal berbayar.

### 1.4 Target Users

**General Users:** Individu yang ingin mengenali objek dalam lingkungan sehari-hari.

**Students:** Pelajar dan mahasiswa yang ingin mengeksplorasi Computer Vision.

**Technology Enthusiasts:** Pengguna yang ingin mencoba penerapan Deep Learning dalam aplikasi web.

### 1.5 Product Value Proposition

Visionary AI menggabungkan empat kemampuan utama:

- Real-time visual object recognition.
- Object segmentation and counting.
- Browser-based Deep Learning inference.
- Personal detection history and analytics.

Aplikasi tidak hanya menampilkan prediksi, tetapi juga memungkinkan pengguna menyimpan dan menganalisis hasil pemindaian melalui akun pribadi.

---

## 2. Project Scope

### 2.1 Included Features

**Core AI Features**
- Real-Time Object Detection.
- Image Upload Detection.
- Multi-Object Detection.
- Bounding Box Visualization.
- Object Segmentation.
- Smart Object Counting.
- Confidence Score.
- Confidence Threshold.
- Camera Switching.

**User Management**
- Register.
- Login.
- Logout.
- Profile.
- Change Password.
- User Settings.

**Data Management**
- Save Detection.
- Detection History.
- Detection Detail.
- Delete Detection.
- Detection Analytics.

**Application Interface**
- Landing Page.
- User Dashboard.
- Responsive Navigation.
- Loading, Empty, dan Error States.

### 2.2 Excluded Features

- Object Tracking.
- Face Recognition.
- Biometric Identification.
- AI Chatbot.
- Generative AI.
- External AI APIs.
- Video Recording.
- Video Upload Detection.
- Payment Gateway.
- Subscription.
- Admin Dashboard.
- User-facing Model Training.

### 2.3 Constraints

Model hanya dapat mengenali kategori objek yang didukung oleh bobot yang digunakan.

Performa AI bergantung pada browser, hardware pengguna, model, dan execution provider.

Ketersediaan WebGPU tidak boleh dianggap universal. Sistem harus menyediakan fallback dan pesan kompatibilitas.

Tidak semua kategori objek memiliki representasi yang sama pada dataset model.

---

## 3. User Roles

### 3.1 Guest

Guest dapat:
- Mengakses Landing Page.
- Mencoba Live Detection.
- Mencoba Image Detection.
- Menggunakan Bounding Box.
- Menggunakan Object Segmentation.
- Menggunakan Smart Counting.
- Mengatur threshold sementara.
- Register dan Login.

Guest tidak dapat:
- Menyimpan history secara permanen.
- Mengakses dashboard pribadi.
- Mengakses analytics akun.

### 3.2 Authenticated User

Authenticated User dapat:
- Menggunakan seluruh fitur deteksi.
- Menyimpan hasil pemindaian.
- Mengakses dan menghapus history.
- Melihat detail hasil deteksi.
- Mengakses dashboard dan analytics.
- Mengelola profil dan pengaturan.
- Logout.

Seluruh data pribadi wajib dilindungi dengan autentikasi dan authorization berdasarkan pemilik.

---

## 4. Functional Requirements

### FR-01 — Landing Page

Landing Page memperkenalkan Visionary AI dan memberikan akses cepat ke fitur utama.

**Sections:**
1. Navbar.
2. Hero Section.
3. AI Detection Preview.
4. Core Features.
5. How It Works.
6. Technology Overview.
7. Final CTA.
8. Footer.

**Acceptance Criteria:**
- CTA menuju halaman yang benar.
- Pengunjung dapat mencoba fitur deteksi.
- Navbar responsif.
- Preview demo tidak mengklaim hasil AI palsu sebagai inference langsung.
- Tampilan konsisten dengan design system.

### FR-02 — Register & Login

Sistem menyediakan registrasi dan autentikasi pengguna.

**Register Fields:**
- Full Name.
- Email.
- Password.
- Confirm Password.

**Login Fields:**
- Email.
- Password.

**Rules:**
- Email valid dan unik.
- Password minimal delapan karakter.
- Password disimpan sebagai secure hash.
- Akses halaman privat membutuhkan sesi valid.
- Error autentikasi tidak boleh membocorkan informasi sensitif.
- Logout mengakhiri sesi yang berlaku.

**Acceptance Criteria:**
- Pengguna berhasil membuat akun dengan input valid.
- Email duplikat ditolak.
- Password tidak pernah tersimpan sebagai plaintext.
- Pengguna dapat login dan logout.
- Session expiration ditangani dengan benar.

### FR-03 — Dashboard

Dashboard menampilkan ringkasan aktivitas pengguna.

**Summary Cards:**
- Total Saved Detections.
- Total Objects Detected.
- Unique Object Categories.
- Most Detected Object.

**Additional Sections:**
- Recent Detections.
- Detection Activity.
- Quick Actions.

**Acceptance Criteria:**
- Semua data diperoleh dari backend.
- Ringkasan dibatasi berdasarkan pengguna aktif.
- Empty state ditampilkan ketika data belum tersedia.
- Data berubah setelah history ditambahkan atau dihapus.

### FR-04 — Live Object Detection

Fitur utama untuk mendeteksi objek secara otomatis melalui kamera.

**Components:**
- Camera Preview.
- Start/Stop Camera.
- Switch Camera.
- Model Loading Indicator.
- Inference Status.
- Bounding Box / Segmentation Controls.
- Detected Objects Panel.
- Smart Counting.
- Confidence Threshold.
- Save Detection.

**Business Flow:**
1. Pengguna membuka Live Detection.
2. Browser meminta izin kamera.
3. Model ONNX dimuat apabila belum tersedia.
4. Kamera mulai menampilkan video.
5. Frame diproses melalui ONNX Runtime Web.
6. Browser memperoleh output model.
7. Postprocessing menghasilkan objek, koordinat, confidence, dan mask.
8. Hasil divisualisasikan pada preview.
9. Prediksi diperbarui selama kamera aktif.

**Rules:**
- Inference dilakukan langsung di browser.
- Tidak ada pengiriman frame kontinu ke FastAPI.
- Kamera dapat dihentikan.
- Frame lama boleh dilewati agar UI tetap responsif.
- Tidak ada penyimpanan otomatis.
- Hasil harus sesuai dengan frame yang diproses.
- Izin kamera harus diberikan pengguna.

**Acceptance Criteria:**
- Kamera aktif setelah izin diberikan.
- Model memproses frame otomatis.
- Hasil tampil tanpa upload manual.
- Overlay sejajar dengan objek.
- Stop Camera menghentikan stream.
- Kesalahan kamera dan model ditangani dengan jelas.

### FR-05 — Image Detection

Pengguna dapat mendeteksi objek pada gambar yang dipilih.

**Supported Formats:**
- JPG.
- JPEG.
- PNG.
- WebP.

**Maximum Initial Size:** 10 MB.

**Components:**
- File Upload.
- Drag & Drop.
- Image Preview.
- Detect Button.
- Detection Results.
- Object Counting.
- Visualization Mode.
- Save Detection.

**Acceptance Criteria:**
- File valid dapat diproses.
- File tidak valid ditolak.
- Gambar diproses secara lokal di browser.
- Hasil menampilkan kategori, posisi, dan confidence.
- Pengguna dapat mengganti gambar.
- Penyimpanan hanya dilakukan berdasarkan tindakan pengguna.

### FR-06 — Multi-Object Detection

Sistem dapat menampilkan beberapa objek pada satu gambar.

Setiap hasil prediksi berisi:
- Class ID.
- Class Label.
- Confidence.
- Bounding Box.
- Segmentation Information.

**Acceptance Criteria:**
- Lebih dari satu objek dapat ditampilkan.
- Objek berbeda memiliki prediksi masing-masing.
- Jumlah deteksi konsisten dengan hasil model.
- Kondisi zero detection memiliki empty state.

### FR-07 — Bounding Box

Bounding box menandai lokasi objek.

**Requirements:**
- Posisi sesuai hasil model.
- Label dan confidence terlihat.
- Koordinat dikoreksi terhadap ukuran input model.
- Scaling benar pada desktop dan mobile.
- Mendukung gambar dengan aspect ratio berbeda.

### FR-08 — Object Segmentation

Sistem menghasilkan instance segmentation menggunakan YOLO Segmentation.

**Visualization Modes:**
- Bounding Box.
- Segmentation Mask.
- Both.

**Requirements:**
- Mask mengikuti area objek.
- Overlay menggunakan transparansi.
- Pengguna dapat mengganti mode tanpa inference ulang jika data masih tersedia.
- Mask tidak boleh bergeser akibat resize viewport.
- Hasil segmentation dapat disimpan sebagai metadata untuk history.

### FR-09 — Smart Object Counting

Menghitung objek berdasarkan kategori pada frame atau gambar yang sedang dianalisis.

**Example:**
- Car: 2
- Motorcycle: 1
- Chair: 3

**Rules:**
- Menggunakan hasil prediksi yang lolos threshold.
- Kelas yang sama dijumlahkan.
- Counting diperbarui sesuai inference.
- Tidak menggunakan Object Tracking.
- Tidak menghitung jumlah objek unik sepanjang sesi.

**Acceptance Criteria:**
- Total counting sesuai hasil deteksi.
- Jumlah per kategori benar.
- Perubahan confidence threshold memengaruhi hasil counting.
- Counting disimpan saat pengguna menyimpan snapshot.

### FR-10 — Confidence Threshold

Pengguna dapat mengatur confidence threshold.

**Initial Configuration:**
- Default: 0.50.
- Minimum: 0.10.
- Maximum: 0.95.
- Step: 0.05.

**Rules:**
- Prediksi di bawah threshold disembunyikan.
- Counting menyesuaikan threshold.
- Pengaturan pengguna login dapat disimpan.
- Confidence bukan probabilitas kebenaran yang terkalibrasi.

### FR-11 — Save Detection

Authenticated User dapat menyimpan hasil pemindaian.

**Live Detection:**
- Simpan snapshot dari frame terdeteksi.
- Simpan hasil prediksi yang sesuai.
- Jangan mengambil frame baru dengan metadata dari frame lama.

**Image Detection:**
- Simpan gambar yang dianalisis.
- Simpan hasil prediksi dan konfigurasi model.

**Data:**
- User ID.
- Image Identifier.
- Detection Time.
- Source Type.
- Model Version.
- Confidence Threshold.
- Total Objects.
- Object Metadata.
- Segmentation Data.

**Rules:**
- Tidak ada autosave.
- Guest harus login untuk menyimpan.
- Penyimpanan tidak boleh menduplikasi record akibat klik berulang.
- Gambar disimpan secara privat melalui Cloudinary.
- Metadata disimpan melalui FastAPI ke Neon.
- Prediksi dari browser dianggap data client, bukan hasil verifikasi server.

**Acceptance Criteria:**
- Hasil dapat disimpan oleh pengguna login.
- Riwayat baru muncul di History.
- Gambar dan metadata konsisten.
- Jika penyimpanan gagal, tidak muncul pesan sukses.
- Tidak terjadi file yatim secara permanen akibat kegagalan proses.

### FR-12 — Detection History

Pengguna dapat mengakses seluruh hasil deteksi yang disimpan.

**Information:**
- Thumbnail.
- Detection Date.
- Source Type.
- Total Objects.
- Object Labels.

**Features:**
- Search.
- Filter Source.
- Pagination.
- Sort Newest.
- View Detail.
- Delete.

**Acceptance Criteria:**
- Pengguna hanya melihat datanya sendiri.
- Filter bekerja.
- Pagination bekerja.
- History terbaru ditampilkan lebih dahulu.
- Empty state tersedia.

### FR-13 — Detection Detail

Menampilkan detail satu pemindaian.

**Information:**
- Original Saved Image.
- Detected Objects.
- Bounding Boxes.
- Segmentation Masks.
- Confidence Scores.
- Object Count.
- Model Version.
- Detection Date.
- Source Type.

Pengguna dapat mengganti mode visualisasi pada gambar yang tersimpan.

Overlay harus direkonstruksi berdasarkan metadata, tanpa inference ulang.

**Acceptance Criteria:**
- Seluruh informasi sesuai history.
- Overlay dapat ditampilkan ulang.
- Pengguna lain tidak dapat mengakses detail.
- Delete tersedia dengan konfirmasi.

### FR-14 — Detection Analytics

Analytics menggunakan data riwayat tersimpan.

**Metrics:**
- Total Detections.
- Total Detected Objects.
- Unique Categories.
- Average Confidence.

**Charts:**
- Detection Activity.
- Top Detected Objects.
- Object Distribution.
- Detection Source Comparison.

**Date Range:**
- 7 Days.
- 30 Days.
- 90 Days.
- All Time.

**Acceptance Criteria:**
- Statistik berasal dari database nyata.
- Data sesuai filter.
- Penghapusan history memengaruhi statistik.
- Tidak menghitung frame yang tidak disimpan.

### FR-15 — Profile

Informasi:
- Full Name.
- Email.
- Account Created At.

Fitur:
- Update Name.
- Change Password.
- Logout.

### FR-16 — User Settings

Pengaturan:
- Default Confidence Threshold.
- Default Visualization Mode.
- Show Confidence Labels.
- Preferred Camera jika didukung.

Pengaturan pengguna login tersimpan dalam Neon.

Guest menggunakan preferensi sementara di browser.

---

## 5. User Experience Requirements

### 5.1 Design Principles

- Modern.
- Professional.
- Minimal.
- Responsive.
- Accessible.
- Interactive.
- Visually consistent.

### 5.2 Visual Direction

Gunakan desain AI SaaS dengan warna Deep Navy, Slate, Cyan, dan Teal.

Elemen visual harus berfungsi mendukung pengalaman pengguna, bukan hanya dekorasi.

Landing Page perlu terlihat menarik dan memiliki identitas produk yang kuat.

Dashboard harus mudah dipahami tanpa terlalu banyak kartu atau elemen tidak penting.

### 5.3 Desktop Layout

- Sidebar kiri.
- Main Content kanan.
- Header halaman.
- Camera Preview sebagai fokus fitur deteksi.
- Panel hasil deteksi di sisi kamera.

### 5.4 Mobile Layout

- Navigasi ringkas.
- Kamera sebagai elemen utama.
- Kontrol yang mudah dijangkau.
- Hasil deteksi di bawah camera preview.
- Panel analytics responsif.
- Overlay mempertahankan rasio video.

### 5.5 UI States

Wajib mendukung:
- Loading.
- Empty.
- Error.
- Success.
- Disabled.
- Permission Required.
- Model Downloading.
- Model Initialization.
- Inference Running.
- Model Unsupported.
- Camera Unavailable.

---

## 6. AI & Deep Learning Architecture

### 6.1 Training Environment

Gunakan Python, PyTorch, dan Ultralytics YOLO untuk:

- Model Preparation.
- Model Evaluation.
- Optional Fine-Tuning.
- ONNX Export.
- Model Validation.

### 6.2 Production Environment

Gunakan ONNX Runtime Web di browser.

Tidak menggunakan PyTorch pada backend production.

Tidak menggunakan server YOLO inference.

### 6.3 Model Initialization

1. Browser membuka halaman deteksi.
2. Sistem memeriksa kompatibilitas runtime.
3. Sistem memuat ONNX model.
4. Sistem memilih WebGPU jika model dan perangkat mendukung.
5. Jika gagal, sistem mencoba WASM.
6. Model siap menerima frame atau gambar.

### 6.4 Preprocessing

- Decode image.
- Correct orientation.
- Resize / letterbox.
- RGB conversion.
- Tensor normalization.
- Input tensor construction.

### 6.5 Inference

ONNX Runtime Web memproses tensor dan mengembalikan output model.

### 6.6 Postprocessing

- Decode class predictions.
- Filter confidence.
- Non-Maximum Suppression jika diperlukan.
- Recover bounding boxes.
- Generate segmentation masks.
- Correct image scale.
- Count object categories.

Format postprocessing wajib mengikuti bentuk output model ONNX yang digunakan.

### 6.7 Model Version Management

Setiap model mempunyai:
- Model Name.
- Model Version.
- Class Labels.
- Input Shape.
- Output Specification.
- Source / License Metadata.

Setiap saved detection menyimpan versi model yang digunakan.

### 6.8 Model Evaluation

Evaluasi:
- Precision.
- Recall.
- Detection mAP.
- Segmentation mAP.
- Inference Latency.
- Browser Compatibility.
- Memory Usage.

Pengujian harus mencakup desktop dan mobile.

---

## 7. System Architecture

### 7.1 Frontend Responsibilities

- Navigation.
- Authentication UI.
- Camera Access.
- Image Upload.
- ONNX Model Loading.
- Browser Inference.
- Detection Overlay.
- Segmentation Rendering.
- Smart Counting.
- API Integration.
- History Viewer.
- Analytics Visualization.

### 7.2 Backend Responsibilities

- Authentication.
- Authorization.
- Profile Management.
- History Management.
- Database Access.
- Secure Image Storage.
- Analytics API.
- Session Management.

### 7.3 Architecture Principle

Browser melakukan AI inference.

FastAPI mengelola data dan layanan aplikasi.

Neon menyimpan data terstruktur.

Cloudinary menyimpan file gambar.

Tidak ada pemrosesan kamera real-time melalui FastAPI.

---

## 8. Database Schema

### 8.1 `users`

- id: UUID Primary Key
- full_name: VARCHAR NOT NULL
- email: VARCHAR UNIQUE NOT NULL
- password_hash: VARCHAR NOT NULL
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ

### 8.2 `detections`

- id: UUID Primary Key
- user_id: UUID Foreign Key
- source_type: VARCHAR
- image_public_id: VARCHAR
- model_version: VARCHAR
- confidence_threshold: FLOAT
- total_objects: INTEGER
- detected_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ

### 8.3 `detected_objects`

- id: UUID Primary Key
- detection_id: UUID Foreign Key
- class_id: INTEGER
- object_name: VARCHAR
- confidence: FLOAT
- bounding_box: JSONB
- segmentation_data: JSONB
- created_at: TIMESTAMPTZ

### 8.4 `user_settings`

- id: UUID Primary Key
- user_id: UUID Unique Foreign Key
- confidence_threshold: FLOAT
- visualization_mode: VARCHAR
- show_confidence: BOOLEAN
- preferred_camera: VARCHAR NULL
- updated_at: TIMESTAMPTZ

### 8.5 Relationships

- User 1:N Detections.
- Detection 1:N Detected Objects.
- User 1:1 User Settings.

### 8.6 Database Security

- Authorization berdasarkan user_id.
- Foreign keys.
- Parameterized queries.
- Indexing untuk query history.
- Alembic migrations.
- Validasi server-side.
- Transaction handling.

---

## 9. Backend API Specification

Base URL: `/api/v1`

### Authentication

| Method | Endpoint |
|---|---|
| POST | `/auth/register` |
| POST | `/auth/login` |
| POST | `/auth/logout` |
| POST | `/auth/refresh` |
| GET | `/auth/me` |
| PATCH | `/auth/password` |

### User Management

| Method | Endpoint |
|---|---|
| GET | `/users/me` |
| PATCH | `/users/me` |
| GET | `/users/settings` |
| PATCH | `/users/settings` |

### Detection History

| Method | Endpoint |
|---|---|
| POST | `/detections` |
| GET | `/detections` |
| GET | `/detections/{id}` |
| DELETE | `/detections/{id}` |

### Dashboard

| Method | Endpoint |
|---|---|
| GET | `/dashboard/overview` |

### Analytics

| Method | Endpoint |
|---|---|
| GET | `/analytics/summary` |
| GET | `/analytics/activity` |
| GET | `/analytics/objects` |
| GET | `/analytics/sources` |

### Storage

Backend menyediakan mekanisme:
- Generate authorized upload.
- Validate uploaded asset.
- Generate authorized image access.
- Delete stored asset.

Tidak ada endpoint produksi yang menerima frame untuk menjalankan YOLO inference.

---

## 10. Cloudinary Storage Requirements

### 10.1 File Types

- JPEG.
- PNG.
- WebP.

### 10.2 Save Flow

1. Pengguna menekan Save Detection.
2. Browser menyiapkan gambar dan metadata.
3. Backend memvalidasi akun dan permintaan upload.
4. Gambar disimpan melalui mekanisme Cloudinary yang aman.
5. Backend memvalidasi asset yang berhasil diunggah.
6. Metadata disimpan ke Neon.
7. History baru ditampilkan.

### 10.3 Storage Security

- File tidak boleh otomatis menjadi aset publik yang dapat diakses siapa saja.
- Gunakan authenticated/private delivery.
- Storage identifier disimpan dalam database.
- Validasi kepemilikan sebelum memberikan akses gambar.
- Hapus file saat history dihapus.
- Batasi ukuran dan format.

### 10.4 Consistency

Sistem harus menangani kasus:
- Upload berhasil, database gagal.
- Database berhasil, permintaan respons gagal.
- Delete metadata berhasil, file deletion gagal.

Gunakan mekanisme retry dan cleanup yang aman, serta hindari duplikasi penyimpanan.

---

## 11. Security & Privacy Requirements

### Authentication
- Secure password hashing.
- Secure session management.
- Short-lived access tokens.
- Protected endpoints.
- Rate limiting.

### Data Protection
- HTTPS.
- Input validation.
- CORS configuration.
- CSRF protection sesuai mekanisme sesi.
- Environment variable security.
- Ownership authorization.

### Privacy
- Camera permission.
- No automatic frame upload.
- No automatic image storage.
- Private detection history.
- User-controlled deletion.
- Penjelasan pemrosesan data melalui privacy notice.

### Client-Side AI Limitation

Karena inference berjalan di browser, hasil prediksi dikirim oleh perangkat pengguna.

Backend harus memperlakukan label, confidence, bounding box, dan segmentation metadata sebagai data yang belum diverifikasi, bukan bukti hasil model yang tidak dapat dimanipulasi.

---

## 12. Performance Requirements

### 12.1 User Interface

- Navigasi tetap responsif saat model memuat.
- Kamera tidak boleh freeze karena proses inference.
- Tampilkan loading state.
- Hindari blocking main thread jika memungkinkan.
- Gunakan lazy loading model.

### 12.2 AI Runtime

- Batasi ukuran input.
- Atur interval inference.
- Hindari antrean frame.
- Pilih model ringan.
- Gunakan WASM fallback.
- Cache model sesuai kemampuan browser.
- Pantau memory usage.

### 12.3 Performance Targets

Target awal untuk perangkat pengujian yang memadai:

- Kamera menampilkan video secara lancar.
- Hasil AI diperbarui secara berkala.
- Sasaran awal 2–5 inference updates per second jika perangkat mampu.
- Overlay tetap sinkron dengan frame hasil inference.
- Tidak ada memory leak signifikan pada penggunaan berulang.

Tidak menetapkan FPS universal tanpa benchmark perangkat.

### 12.4 Compatibility

- Chrome Desktop.
- Edge Desktop.
- Chrome Android.
- Safari iPhone.

Fitur memerlukan browser dengan dukungan kamera dan ONNX Runtime Web yang kompatibel.

---

## 13. Reliability Requirements

- Graceful fallback ketika WebGPU gagal.
- Error handling ketika model tidak dapat dimuat.
- Kamera dapat dihentikan kapan saja.
- Resource kamera dibersihkan ketika pengguna keluar halaman.
- File upload gagal tidak membuat history palsu.
- Storage cleanup tersedia.
- Koneksi API yang gagal memiliki retry yang sesuai.
- Model hanya dimuat ulang jika memang diperlukan.

---

## 14. Testing Strategy

### 14.1 Unit Tests

Frontend:
- Confidence filtering.
- Counting.
- Coordinate transformation.
- Detection formatting.

Backend:
- Authentication.
- Authorization.
- Input validation.
- History services.
- Analytics calculations.

### 14.2 Integration Tests

- SvelteKit dengan FastAPI.
- FastAPI dengan Neon.
- FastAPI dengan Cloudinary.
- Authentication flow.
- Save Detection flow.
- Delete Detection flow.

### 14.3 AI Validation

Bandingkan hasil model PyTorch dengan model ONNX menggunakan gambar uji yang sama.

Verifikasi:
- Class predictions.
- Confidence.
- Bounding boxes.
- Segmentation masks.
- Counting.

### 14.4 End-to-End Tests

Skenario:
1. Register.
2. Login.
3. Open Live Detection.
4. Grant Camera Permission.
5. Wait for Model Loading.
6. Detect Objects.
7. Change Visualization Mode.
8. Adjust Confidence Threshold.
9. Save Detection.
10. Open History.
11. Open Detection Detail.
12. Open Analytics.
13. Delete History.
14. Logout.

### 14.5 Device Testing

Uji:
- Desktop dengan hardware yang tersedia.
- Android browser.
- Safari iPhone.

Catat model perangkat, browser, resolution, inference latency, dan memory behavior.

---

## 15. Development Roadmap

Seluruh fase merupakan bagian dari target aplikasi lengkap versi 1.0.

### Phase 1 — Foundation

- Repository Setup.
- SvelteKit.
- FastAPI.
- Neon.
- Design System.
- Environment Configuration.

### Phase 2 — Authentication

- Register.
- Login.
- Logout.
- Protected Routes.
- User Profile.
- Settings.

### Phase 3 — AI Preparation

- YOLO Model Selection.
- PyTorch Model Testing.
- ONNX Export.
- ONNX Validation.
- Class Metadata.
- Browser Compatibility Tests.

### Phase 4 — AI Browser Integration

- ONNX Runtime Web.
- Model Loader.
- Preprocessing.
- Postprocessing.
- Bounding Box.
- Segmentation.
- Counting.

### Phase 5 — Detection Features

- Live Camera.
- Image Upload.
- Confidence Threshold.
- Camera Switching.
- Visualization Modes.
- Detection States.

### Phase 6 — History & Storage

- Cloudinary.
- Save Detection.
- Neon Metadata.
- History.
- Detail.
- Delete.

### Phase 7 — Dashboard & Analytics

- Dashboard Overview.
- Recent Detections.
- Activity Charts.
- Object Statistics.
- Date Filtering.

### Phase 8 — Testing & Deployment

- End-to-End Testing.
- AI Performance Testing.
- Security Testing.
- Responsive Optimization.
- Vercel Frontend Deployment.
- Vercel FastAPI Deployment.
- Production Validation.

---

## 16. Product Acceptance Criteria

Visionary AI dianggap memenuhi spesifikasi apabila:

1. Pengguna dapat melakukan registrasi dan login.
2. Pengguna dapat mengaktifkan kamera dari browser yang didukung.
3. Model ONNX dapat memproses frame kamera secara lokal.
4. Objek dapat dikenali dan ditampilkan melalui bounding box.
5. Instance segmentation dapat ditampilkan.
6. Object counting mengikuti hasil inference.
7. Confidence threshold bekerja.
8. Upload gambar dapat digunakan.
9. Hasil deteksi dapat disimpan setelah login.
10. Foto tersimpan di Cloudinary dan metadata di Neon.
11. History dan Detail berfungsi.
12. Analytics menggunakan data nyata.
13. Pengguna tidak dapat mengakses data akun lain.
14. Hasil history dapat dihapus.
15. Backend tidak memerlukan PyTorch dalam production.
16. Frontend dan backend dapat dibangun serta di-deploy melalui konfigurasi Vercel yang sesuai.
17. Tidak terdapat tombol utama tanpa implementasi.
18. Semua fitur menunjukkan loading, error, atau empty state yang sesuai.

---

## 17. Risks & Mitigation

### Risk 1 — Browser Inference Lambat

Mitigation:
- Gunakan model kecil.
- Optimalkan resolusi input.
- Batasi inference frequency.
- WASM fallback.
- Benchmark perangkat.

### Risk 2 — WebGPU Tidak Didukung

Mitigation:
- Feature detection.
- WASM execution provider.
- User-facing compatibility notice.

### Risk 3 — Segmentation Output Tidak Kompatibel

Mitigation:
- Pilih model dan opset yang didukung.
- Validasi output tensor.
- Bandingkan dengan PyTorch.
- Uji mask reconstruction.

### Risk 4 — Mobile Memory Limit

Mitigation:
- Lazy loading.
- Resource cleanup.
- Batasi resolusi.
- Gunakan model yang lebih ringan.

### Risk 5 — Storage Quota

Mitigation:
- Compression.
- Upload only when saved.
- File size limits.
- Delete unused assets.

### Risk 6 — Browser-Generated Metadata Tidak Terpercaya

Mitigation:
- Schema validation.
- Ownership authorization.
- Input size limits.
- Tidak menggunakannya untuk pengambilan keputusan keamanan.

### Risk 7 — Third-Party Free Tier Limits

Mitigation:
- Pantau pemakaian Vercel, Neon, dan Cloudinary.
- Hindari proses inference di server.
- Optimalkan query.
- Kompres gambar.
- Gunakan resource quotas.

### Risk 8 — Model Licensing

Mitigation:
- Periksa lisensi source code dan bobot model.
- Dokumentasikan lisensi.
- Sesuaikan distribusi aplikasi dengan kewajiban lisensi.

---

## 18. Success Metrics

**Functional Metrics**
- Seluruh alur utama berjalan.
- Penyimpanan dan penghapusan history konsisten.
- Dashboard dan Analytics menampilkan data aktual.

**AI Metrics**
- Model berhasil dimuat.
- Prediksi dan segmentasi dapat divisualisasikan.
- Hasil ONNX konsisten secara wajar dengan PyTorch.
- Latensi inference terukur.
- Kompatibilitas perangkat terdokumentasi.

**Security Metrics**
- Tidak ada akses data lintas akun.
- Password tidak disimpan plaintext.
- File history menggunakan kontrol akses.
- Secret tidak terekspos di frontend.

**Usability Metrics**
- Navigasi jelas.
- Kamera mudah digunakan.
- Pengguna dapat menyimpan dan membuka kembali hasil.
- Empty dan error state informatif.
- Tampilan responsif.

---

## 19. Final Technology Stack

| Component | Technology |
|---|---|
| Frontend | SvelteKit + TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn-svelte |
| Backend | Python + FastAPI |
| Database | Neon PostgreSQL |
| ORM | SQLAlchemy |
| Migration | Alembic |
| Authentication | JWT + Secure Session |
| Image Storage | Cloudinary |
| ML Development | PyTorch + Ultralytics YOLO |
| Model Format | ONNX |
| Production AI Runtime | ONNX Runtime Web |
| Frontend Hosting | Vercel |
| Backend Hosting | Vercel |

---

## 20. Final Product Definition

Visionary AI merupakan aplikasi Full-Stack Computer Vision yang memungkinkan pengguna mendeteksi, mengenali, menghitung, dan melakukan segmentasi objek secara real-time melalui browser.

Aplikasi mengintegrasikan Deep Learning langsung di perangkat pengguna dengan sistem backend untuk mengelola akun, penyimpanan hasil, dan analitik.

Model AI dikembangkan menggunakan Python dan PyTorch, kemudian dijalankan melalui ONNX Runtime Web.

Dengan pendekatan ini, Visionary AI tidak membutuhkan API AI eksternal maupun server khusus untuk inference.

**Product Vision:**

*Making Computer Vision Accessible Through Intelligent Real-Time Object Recognition.*

