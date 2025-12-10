import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";

function unauthorized() {
  return NextResponse.json(
    { success: false, error: "Unauthorized", code: 401 },
    { status: 401 }
  );
}

export async function requireAuth(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: unauthorized() };
    }

    const token = authHeader.split(" ")[1];

    const payload = await verifyAccessToken(token);

    return { user: payload };
  } catch (err) {
    console.error("JWT verify error:", err);
    return { error: unauthorized() };
  }
}

export async function requireAdmin(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth;

  const user = auth.user;
  if (user.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { success: false, error: "Forbidden: Admin only", code: 403 },
        { status: 403 }
      ),
    };
  }

  return { user };
}
