# Sistem Inventori Barang (Next.js + Prisma + JWT + Pagination + Refresh Token)

## 1. Deskripsi Proyek
Sistem ini adalah API Inventori Barang yang dibangun menggunakan:
- Next.js 16 (App Router)
- Prisma ORM 6.19.0
- PostgreSQL
- JWT Authentication (Access Token + Refresh Token)
- Rate Limiting
- Logging Middleware
- Role-based Access Control (Admin & User)

Fitur utama:
- Login + Registrasi pengguna
- Manajemen user (Admin Only)
- Manajemen produk (CRUD + Bulk insert)
- Pagination
- Proteksi API dengan JWT
- Refresh token untuk memperpanjang sesi login
- Rate limit anti brute-force
- Logging request untuk monitoring

## 2. Teknologi yang Digunakan
| Teknologi | Fungsi |
|----------|--------|
| Next.js 16 | Backend API |
| Prisma ORM 6.19 | Query database |
| PostgreSQL | Database utama |
| bcryptjs | Hash password |
| jose 6.x | JWT (sign & verify) |
| Rate limiting custom | Mencegah spam/login brute-force |

## 3. Cara Install Project
### 1. Clone project  
```
git clone <repository>
cd inventori
```

### 2. Install dependencies  
```
npm install
```

### 3. Buat file .env
```
DATABASE_URL="postgresql://user:password@localhost:5432/inventori"
JWT_SECRET="secret_jwt_minimal_32_char"
```

### 4. Generate prisma client  
```
npx prisma generate
```

### 5. Migrasi database  
```
npx prisma migrate dev --name init
```

### 6. Jalankan server  
```
npm run dev
```

## 4. Struktur Folder
```
project/
├─ prisma/
│  └─ schema.prisma
├─ lib/
│  ├─ prisma.js
│  ├─ auth.js
│  ├─ jwt.js
│  ├─ logger.js
│  └─ rateLimit.js
└─ app/
   └─ api/
      ├─ auth/
      │  ├─ register/route.js
      │  ├─ login/route.js
      │  └─ refresh/route.js
      ├─ users/route.js
      └─ products/
         ├─ route.js
         └─ [id]/route.js
```

## 5. Skema Database (Prisma)
```
model User {
  id        Int       @id @default(autoincrement())
  name      String
  email     String    @unique
  password  String
  role      Role      @default(USER)
  createdAt DateTime  @default(now())
  products  Product[] @relation("UserProducts")
}

model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  stock       Int      @default(0)
  price       Int
  createdAt   DateTime @default(now())
  createdById Int?
  createdBy   User?    @relation("UserProducts", fields: [createdById], references: [id])
}

enum Role {
  ADMIN
  USER
}
```

## 6. Sistem Autentikasi JWT
Sistem ini menggunakan 2 token:
### Access Token (masa pendek)
- Digunakan akses API
- Expired 15 menit

### Refresh Token (masa panjang)
- Tidak bisa akses API langsung
- Untuk memperbarui access token

## 7. Alur Login & Refresh Token
1. User login → server kirim accessToken + refreshToken  
2. Access token expired → user panggil /refresh  
3. Server kirim access token baru  

## 8. Role System
| Role | Akses |
|------|-------|
| ADMIN | CRUD user, CRUD produk, bulk insert |
| USER | lihat produk, update produk |

## 9. Pagination
```
GET /api/products?page=1&limit=5
```

## 10. Rate Limiting
Jika request terlalu banyak:
```
429 Too Many Requests
```

## 11. Logging
Contoh log:
```
[LOG] [products-list] GET /api/products - 12ms
```

## 12. Dokumentasi API
### Register
```
POST /api/auth/register
```
Body:
```
{
  "name": "Admin",
  "email": "admin@gmail.com",
  "password": "123456",
  "role": "ADMIN"
}
```

### Login
```
POST /api/auth/login
```
Body:
```
{
  "email": "admin@gmail.com",
  "password": "123456"
}
```

### Refresh Token
```
POST /api/auth/refresh
```
Body:
```
{
  "refreshToken": "xxxxx"
}
```

### GET Produk (Pagination)
```
GET /api/products?page=1&limit=10
```

### Tambah Produk (Admin)
```
POST /api/products
```

### Bulk Insert
```
[
  { "name": "Mouse", "price": 100000 },
  { "name": "Keyboard", "price": 200000 }
]
```

## 13. Cara Uji API
Semua endpoint bisa diuji via Postman.

## 14. Kesimpulan
Sistem ini menerapkan:
- JWT Access + Refresh Token
- Pagination
- Rate Limiting
- Logging
- Role-based API Security
- Prisma ORM

