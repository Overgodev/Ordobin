import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextRequest } from 'next/server'
import { verifyToken } from './simpleAuth'
import { AuthenticatedUser } from './types'
import prisma from './prisma'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTokenFromRequest(req: NextRequest): string | null {
  // For App Router, get token from Authorization header or cookies
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Try to get from cookies
  const tokenFromCookie = req.cookies.get('authToken')?.value
  return tokenFromCookie || null
}

export async function getUserFromRequest(req: NextRequest): Promise<AuthenticatedUser | null> {
  const token = getTokenFromRequest(req)
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      username: true,
      email: true,
      full_name: true,
      is_active: true,
      created_at: true,
      updated_at: true
    }
  })

  return user && user.is_active ? user : null
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

export function validateUsername(username: string): boolean {
  // 3-50 characters, alphanumeric with underscore or dash
  const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/
  return usernameRegex.test(username)
}