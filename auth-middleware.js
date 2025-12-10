import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET belum di-set di .env");
  }
  return new TextEncoder().encode(secret);
}

export async function requireAuth(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        error: NextResponse.json(
          { success: false, error: "Unauthorized", code: 401 },
          { status: 401 }
        ),
      };
    }

    const token = authHeader.split(" ")[1];
    const secret = getSecretKey();

    const { payload } = await jwtVerify(token, secret);

    return { user: payload };
  } catch (err) {
    console.error("JWT verify error:", err);
    return {
      error: NextResponse.json(
        { success: false, error: "Invalid token", code: 401 },
        { status: 401 }
      ),
    };
  }
}

export async function requireAdmin(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth;

  const user = auth.user;
  if (user.role !== "ADMIN") {
    return { error: forbidden() };
  }

  return { user };
}

export function forbidden() {
  return NextResponse.json(
    { success: false, error: "Forbidden", code: 403 },
    { status: 403 }
  );
}
