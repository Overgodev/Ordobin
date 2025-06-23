// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/simpleAuth'

/* helper — basic email syntax check (same one we used in signup) */
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

/* ───────────────────────── POST /api/auth/login ───────────────────────── */

export async function POST(req: NextRequest) {
  try {
    /* 1. parse body */
    const { email, password } = (await req.json()) as {
      email?: string
      password?: string
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    /* 2. look up user */
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    /* 3. verify password */
    const ok = await comparePassword(password, user.password)
    if (!ok) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    /* 4. issue token */
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    })

    const res = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          is_active: user.is_active,
        },
        token,
      },
      { status: 200 }
    )

    /* 5. set httpOnly cookie */
    res.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    })

    return res
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/* optional: block GET */
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
