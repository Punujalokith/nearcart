import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../../config/database.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';

function makeTokenPayload(user) {
  return { sub: user.id, email: user.email, role: user.role };
}

async function issueTokens(user) {
  const accessToken  = signAccessToken(makeTokenPayload(user));
  const refreshToken = signRefreshToken(makeTokenPayload(user));

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { userId: user.id, token: refreshToken, expiresAt },
  });

  return { accessToken, refreshToken };
}

export async function register({ name, email, password, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role },
  });

  return issueTokens(user);
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  return issueTokens(user);
}

export async function refresh({ refreshToken }) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    const err = new Error('Invalid or expired refresh token');
    err.statusCode = 401;
    throw err;
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    const err = new Error('Refresh token revoked or expired');
    err.statusCode = 401;
    throw err;
  }

  // Token rotation — delete old, issue new
  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 401;
    throw err;
  }

  return issueTokens(user);
}

export async function logout({ refreshToken }) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export async function updateFcmToken(userId, fcmToken) {
  await prisma.user.update({ where: { id: userId }, data: { fcmToken } });
}
