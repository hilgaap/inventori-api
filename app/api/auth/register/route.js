import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { withLogging } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  const limited = checkRateLimit(request, "auth-register");
  if (limited) return limited;

  return withLogging(request, "auth-register", async () => {
    try {
      const body = await request.json();
      const { name, email, password, role } = body;

      if (!name || !email || !password) {
        return NextResponse.json(
          { success: false, error: "Name, email & password wajib diisi", code: 400 },
          { status: 400 }
        );
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "Email sudah terdaftar", code: 400 },
          { status: 400 }
        );
      }

      const hashed = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          role: role === "ADMIN" ? "ADMIN" : "USER",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      return NextResponse.json(
        { success: true, message: "Registrasi berhasil", data: user },
        { status: 201 }
      );
    } catch (err) {
      console.error("Error register:", err);
      return NextResponse.json(
        { success: false, error: "Internal server error", code: 500 },
        { status: 500 }
      );
    }
  });
}
