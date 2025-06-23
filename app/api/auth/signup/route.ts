import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  generateToken,
  hashPassword,
} from "@/lib/simpleAuth";
import { validateEmail, validatePassword } from "@/lib/utils";
import type { ApiResponse } from "@/lib/types";

type SignupBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
};

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    /* ────────────────── 1. Parse & validate input ────────────────── */
    const { firstName, lastName, email, password } =
      (await req.json()) as SignupBody; // <- cast instead of generic

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, error: "All fields are required." },
        { status: 400 }
      );
    }
    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format." },
        { status: 400 }
      );
    }
    if (!validatePassword(password)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Password must be 8+ chars, with upper-case, lower-case and a number.",
        },
        { status: 400 }
      );
    }

    /* ────────────────── 2. Collision check ───────────────────────── */
    const username = email.split("@")[0]; // simple derived username
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { username }] },
    });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error:
            existing.email === email.toLowerCase()
              ? "Email already registered."
              : "Username already taken.",
        },
        { status: 400 }
      );
    }

    /* ────────────────── 3. Hash password & create user ───────────── */
    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username,
        full_name: `${firstName} ${lastName}`.trim(),
        password: hashed, // make sure `password String` exists in schema.prisma
      },
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        is_active: true,
        created_at: true,
      },
    });

    /* ────────────────── 4. Generate token & log activity ─────────── */
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    await prisma.activityLog.create({
      data: {
        user_id: user.id,
        action: "USER_REGISTERED",
        details: {
          timestamp: new Date(),
          userAgent: req.headers.get("user-agent"),
        },
      },
    });

    /* ────────────────── 5. Respond with cookie + JSON ────────────── */
    const res = NextResponse.json(
      {
        success: true,
        message: "User created successfully.",
        data: { user, token },
      },
      { status: 201 }
    );

    res.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 h
      sameSite: "lax",
    });

    return res;
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
