import { SignJWT, jwtVerify } from "jose";

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
const accessExp = "15m";   // access token 15 menit
const refreshExp = "7d";   // refresh token 7 hari

export async function signAccessToken(user) {
  return new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(accessExp)
    .sign(secretKey);
}

export async function signRefreshToken(user) {
  return new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
    type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(refreshExp)
    .sign(secretKey);
}

export async function verifyAccessToken(token) {
  const { payload } = await jwtVerify(token, secretKey);
  return payload;
}

export async function verifyRefreshToken(token) {
  const { payload } = await jwtVerify(token, secretKey);
  if (payload.type !== "refresh") {
    throw new Error("Invalid refresh token");
  }
  return payload;
}
