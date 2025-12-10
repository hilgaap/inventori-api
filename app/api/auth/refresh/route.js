import { NextResponse } from "next/server";
import { verifyRefreshToken, signAccessToken } from "@/lib/jwt";
import { checkRateLimit } from "@/lib/rateLimit";
import { withLogging } from "@/lib/logger";

export async function POST(request) {
  const limited = checkRateLimit(request, "auth-refresh");
  if (limited) return limited;

  return withLogging(request, "auth-refresh", async () => {
    try {
      const { refreshToken } = await request.json();

      if (!refreshToken) {
        return NextResponse.json(
          { success: false, error: "Refresh token wajib dikirim", code: 400 },
          { status: 400 }
        );
      }

      const payload = await verifyRefreshToken(refreshToken);

      const newAccessToken = await signAccessToken({
        id: payload.id,
        email: payload.email,
        role: payload.role,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Access token berhasil diperbarui",
          data: { accessToken: newAccessToken },
        },
        { status: 200 }
      );
    } catch (err) {
      console.error("Error refresh token:", err);
      return NextResponse.json(
        { success: false, error: "Refresh token tidak valid", code: 401 },
        { status: 401 }
      );
    }
  });
}
