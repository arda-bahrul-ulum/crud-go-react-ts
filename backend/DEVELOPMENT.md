# Development Guide

## 🔥 Hot Reload dengan Air

### Install Air

```bash
go install github.com/air-verse/air@latest
```

### Menjalankan Development Server

```bash
# Di folder backend
air
```

### Script Alternatif

```bash
# Windows
run-dev.bat

# Linux/Mac
./run-dev.sh
```

## 📁 File Konfigurasi

- `.air.toml` - Konfigurasi Air untuk hot reload
- `run-dev.sh` - Script untuk Linux/Mac
- `run-dev.bat` - Script untuk Windows

## ⚙️ Konfigurasi Air

Air akan:

- ✅ **Watch** semua file `.go` di project
- ✅ **Exclude** folder `tmp`, `vendor`, `testdata`, `.git`
- ✅ **Exclude** file `_test.go` dan `*.log`
- ✅ **Auto restart** server ketika ada perubahan
- ✅ **Clear screen** setiap restart
- ✅ **Build** ke folder `tmp/main`

## 🚀 Cara Kerja

1. Air memantau perubahan file `.go`
2. Ketika ada perubahan, Air akan:
   - Stop server yang sedang berjalan
   - Build ulang aplikasi
   - Start server baru
3. Server otomatis restart tanpa manual intervention

## 🔧 Troubleshooting

### Air tidak terinstall

```bash
go install github.com/air-verse/air@latest
```

### Port sudah digunakan

```bash
# Cek port yang digunakan
netstat -ano | findstr :8080

# Kill process yang menggunakan port
taskkill /PID <PID> /F
```

### Build error

- Cek file `build-errors.log` untuk detail error
- Pastikan semua dependencies terinstall: `go mod download`
