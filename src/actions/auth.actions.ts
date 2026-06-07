'use server'

import { signIn, signOut } from '@/auth'
import { db } from '@/lib/db'
import { LoginSchema, RegisterSchema } from '@/schemas/auth.schema'
import bcryptjs from 'bcryptjs'
import { AuthError } from 'next-auth'

export type ActionResponse = {
  success: boolean
  error?: string
}

export async function loginUser(input: unknown): Promise<ActionResponse> {
  const parsed = LoginSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid inputs.' }
  }

  const { email, password } = parsed.data

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === 'CredentialsSignin') {
        return { success: false, error: 'Invalid email or password.' }
      }
      return { success: false, error: 'Authentication failed. Please try again.' }
    }
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function registerUser(input: unknown): Promise<ActionResponse> {
  const parsed = RegisterSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid inputs.' }
  }

  const { name, email, password } = parsed.data

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      return { success: false, error: 'An account with this email already exists.' }
    }

    const passwordHash = await bcryptjs.hash(password, 12)

    await db.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    })

    return { success: true }
  } catch (e) {
    console.error('Registration error:', e)
    return { success: false, error: 'Failed to register. Please try again.' }
  }
}

export async function logoutUser(): Promise<void> {
  await signOut({ redirectTo: '/login' })
}
