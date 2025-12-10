import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { withLogging } from "@/lib/logger";

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  return withLogging(request, "users-list", async () => {
    const params = request.nextUrl.searchParams;
    const page = parseInt(params.get("page") || "1", 10);
    const limit = parseInt(params.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { id: "asc" },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Berhasil ambil semua user",
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  });
}

// ADMIN: CREATE USER
export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const bcrypt = require("bcryptjs");

  return withLogging(request, "users-create", async () => {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, password wajib diisi", code: 400 },
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
    });

    return NextResponse.json(
      { success: true, message: "User berhasil dibuat", data: user },
      { status: 201 }
    );
  });
}

// ADMIN: UPDATE USER
export async function PUT(request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  return withLogging(request, "users-update", async () => {
    const body = await request.json();
    const { id, name, email, role } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID wajib dikirim", code: 400 },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        role,
      },
    });

    return NextResponse.json(
      { success: true, message: "User berhasil diupdate", data: updated },
      { status: 200 }
    );
  });
}

// ADMIN: DELETE USER
export async function DELETE(request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  return withLogging(request, "users-delete", async () => {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID wajib dikirim", code: 400 },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(
      { success: true, message: "User berhasil dihapus" },
      { status: 200 }
    );
  });
}
