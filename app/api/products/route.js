import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { withLogging } from "@/lib/logger";

// GET /api/products → semua user login boleh, dengan pagination
export async function GET(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  return withLogging(request, "products-list", async () => {
    const params = request.nextUrl.searchParams;
    const page = parseInt(params.get("page") || "1", 10);
    const limit = parseInt(params.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count(),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Data produk berhasil diambil",
        data: items,
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

// POST /api/products → ADMIN ONLY, mendukung single & bulk array
export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const currentUser = auth.user;

  return withLogging(request, "products-create", async () => {
    const body = await request.json();

    // Bulk insert (array)
    if (Array.isArray(body)) {
      for (const item of body) {
        if (!item.name || item.price == null) {
          return NextResponse.json(
            {
              success: false,
              error: "Setiap produk wajib memiliki name & price",
              code: 400,
            },
            { status: 400 }
          );
        }
      }

      const result = await prisma.product.createMany({
        data: body.map((item) => ({
          name: item.name,
          description: item.description || "",
          stock: Number(item.stock || 0),
          price: Number(item.price),
          createdById: currentUser.id ?? null,
        })),
      });

      return NextResponse.json(
        {
          success: true,
          message: "Bulk insert produk berhasil",
          insertedCount: result.count,
        },
        { status: 201 }
      );
    }

    // Single insert
    const { name, description, stock, price } = body;

    if (!name || price == null) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama dan harga produk wajib diisi",
          code: 400,
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        stock: Number(stock ?? 0),
        price: Number(price),
        createdById: currentUser.id ?? null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Produk berhasil dibuat",
        data: product,
      },
      { status: 201 }
    );
  });
}
