import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role, User } from "@prisma/client";

export const SESSION_COOKIE_NAME = "homehaus_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 1000 * 60 * 15; // 15 minutes
const BCRYPT_ROUNDS = 12;

export type SafeUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

function toSafeUser(user: User): SafeUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

// ---------- primitives ----------

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

// Only the hash is ever stored — the raw token lives solely in the
// user's cookie, so a DB leak alone can't be used to impersonate sessions.
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function requestMeta() {
  const h = await headers();
  return {
    userAgent: h.get("user-agent") ?? undefined,
    ipAddress:
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      undefined,
  };
}

// ---------- session lifecycle ----------

export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const meta = await requestMeta();

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });

  return token;
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Cached per-request so multiple server components can call this cheaply.
export const getCurrentUser = cache(async (): Promise<SafeUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return toSafeUser(session.user);
});

export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error("UNAUTHENTICATED");
    err.name = "UnauthenticatedError";
    throw err;
  }
  return user;
}

// For use in Server Components/pages, where throwing would surface Next's
// generic error boundary instead of sending the visitor to sign in. Server
// Actions and Route Handlers should keep using requireUser()/requireAdmin()
// directly and catch the error themselves, since redirect() there would be
// the wrong UX (they want a returned error, not a navigation).
export async function requireUserOrRedirect(nextPath?: string): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login");
  }
  return user as SafeUser;
}

export async function requireAdminOrRedirect(): Promise<SafeUser> {
  const user = await requireUserOrRedirect("/admin");
  if (user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}

export async function requireAdmin(): Promise<SafeUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    const err = new Error("FORBIDDEN");
    err.name = "ForbiddenError";
    throw err;
  }
  return user;
}

// ---------- login / register ----------

export type AuthResult =
  | { ok: true }
  | { ok: false; error: string };

export async function login(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  // Constant-shape response whether or not the account exists, to avoid
  // leaking which emails are registered via timing/response differences.
  const dummyHash =
    "$2a$12$CwTycUXWue0Thq9StjUM0uJ8i6bB1Rw7q1B2zLZ2r8t2nJc2n9jXW";

  if (!user) {
    await verifyPassword(password, dummyHash);
    return { ok: false, error: "Invalid email or password." };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return {
      ok: false,
      error: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }

  const valid = await verifyPassword(password, user.passwordHash);

  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil:
          attempts >= MAX_FAILED_ATTEMPTS
            ? new Date(Date.now() + LOCKOUT_MS)
            : null,
      },
    });
    return { ok: false, error: "Invalid email or password." };
  }

  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }

  await createSession(user.id);
  return { ok: true };
}

export async function register(
  email: string,
  password: string,
  name: string,
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
      cart: { create: {} },
    },
  });

  await createSession(user.id);
  return { ok: true };
}

export async function logout(): Promise<void> {
  await destroyCurrentSession();
}

// ---------- password reset ----------

const RESET_TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutes

// Always returns ok:true regardless of whether the email exists, so the
// response itself can't be used to enumerate registered accounts. The
// caller decides what to do with the token (send it by email in production;
// see the comment at the call site for why this returns it directly here).
export async function requestPasswordReset(
  email: string,
): Promise<{ token: string | null }> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) return { token: null };

  const token = generateSessionToken();
  await prisma.passwordResetToken.create({
    data: {
      email: normalizedEmail,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  return { token };
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<AuthResult> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, error: "This reset link is invalid or has expired." };
  }

  const user = await prisma.user.findUnique({ where: { email: record.email } });
  if (!user) {
    return { ok: false, error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // Reset password → sign out everywhere. A stolen session shouldn't
    // survive a password change.
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ]);

  return { ok: true };
}
