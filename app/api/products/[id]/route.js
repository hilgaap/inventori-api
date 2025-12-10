import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { withLogging } from "@/lib/logger";

// GET /api/products/:id → semua user login boleh lihat
export async function GET(request, { params }) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);

  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, error: "ID tidak valid", code: 400 },
      { status: 400 }
    );
  }

  return withLogging(request, "product-detail", async () => {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Produk tidak ditemukan", code: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Detail produk berhasil diambil",
        data: product,
      },
      { status: 200 }
    );
  });
}

// PUT /api/products/:id → USER BIASA & ADMIN boleh UPDATE
export async function PUT(request, { params }) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);

  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, error: "ID tidak valid", code: 400 },
      { status: 400 }
    );
  }

  return withLogging(request, "product-update", async () => {
    const body = await request.json();
    const { name, description, stock, price } = body;

    try {
      const updated = await prisma.product.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(stock !== undefined && { stock: Number(stock) }),
          ...(price !== undefined && { price: Number(price) }),
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Produk berhasil diupdate",
          data: updated,
        },
        { status: 200 }
      );
    } catch (err) {
      console.error("Error PUT product:", err);
      return NextResponse.json(
        {
          success: false,
          error: "Produk tidak ditemukan atau data tidak valid",
          code: 400,
        },
        { status: 400 }
      );
    }
  });
}

// DELETE /api/products/:id → HANYA ADMIN boleh delete
export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);

  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, error: "ID tidak valid", code: 400 },
      { status: 400 }
    );
  }

  return withLogging(request, "product-delete", async () => {
    try {
      const deleted = await prisma.product.delete({ where: { id } });

      return NextResponse.json(
        {
          success: true,
          message: "Produk berhasil dihapus",
          data: deleted,
        },
        { status: 200 }
      );
    } catch (err) {
      console.error("Error DELETE product:", err);
      return NextResponse.json(
        { success: false, error: "Produk tidak ditemukan", code: 404 },
        { status: 404 }
      );
    }
  });
}
