// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  // 1. Ambil token dari Header
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      {
        message: "Unauthorized: Token missing",
      },
      {
        status: 401,
      }
    );
  }

  const token = authHeader.split(" ")[1]; // Ambil string setelah "Bearer"
try {
  // 2. Verifikasi Token
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  await jwtVerify(token, secret);

  // 3. Jika sukses, lanjut
  return NextResponse.next();

} catch (error) {
  // 4. Jika token salah/expired
  return NextResponse.json(
    {
      message: "Unauthorized: Invalid token",
    },
    {
      status: 401,
    }
  );
}
}

export const config = {
  // Tentukan route mana yang difilter middleware ini
  // Contoh: Semua route di dalam /api/products dan /api/users
  matcher: ["/api/products/:path*", "/api/users/:path*"],
};
