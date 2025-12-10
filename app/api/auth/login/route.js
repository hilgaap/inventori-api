import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { checkRateLimit } from "@/lib/rateLimit";
import { withLogging } from "@/lib/logger";

export async function POST(request) {
  const limited = checkRateLimit(request, "auth-login");
  if (limited) return limited;

  return withLogging(request, "auth-login", async () => {
    try {
      const { email, password } = await request.json();

      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: "Email & password wajib diisi", code: 400 },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials", code: 401 },
          { status: 401 }
        );
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials", code: 401 },
          { status: 401 }
        );
      }

      const accessToken = await signAccessToken(user);
      const refreshToken = await signRefreshToken(user);

      return NextResponse.json(
        {
          success: true,
          message: "Login berhasil",
          data: {
            accessToken,
            refreshToken,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          },
        },
        { status: 200 }
      );
    } catch (err) {
      console.error("Error login:", err);
      return NextResponse.json(
        { success: false, error: "Internal server error", code: 500 },
        { status: 500 }
      );
    }
  });
}
