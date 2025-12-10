import { NextResponse } from "next/server";

const WINDOW_MS = 60 * 1000; // 1 menit
const MAX_REQ = 10;          // max 10 request / menit per IP per label

const globalStore = globalThis;
if (!globalStore.__rateStore) {
  globalStore.__rateStore = new Map();
}
const store = globalStore.__rateStore;

export function checkRateLimit(request, label = "global") {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.ip ||
    "unknown";

  const key = `${label}:${ip}`;
  const now = Date.now();

  let entry = store.get(key);
  if (!entry) {
    entry = { count: 1, start: now };
    store.set(key, entry);
    return null;
  }

  if (now - entry.start > WINDOW_MS) {
    entry.count = 1;
    entry.start = now;
    return null;
  }

  entry.count += 1;

  if (entry.count > MAX_REQ) {
    return NextResponse.json(
      {
        success: false,
        error: "Terlalu banyak permintaan, coba lagi nanti",
        code: 429,
      },
      { status: 429 }
    );
  }

  return null;
}
