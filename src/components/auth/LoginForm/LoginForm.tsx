'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { loginUser } from '@/actions/auth.actions'
import { LoginSchema } from '@/schemas/auth.schema'
import styles from './LoginForm.module.css'

export function LoginForm(): React.JSX.Element {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setValidationErrors({})

    const parsed = LoginSchema.safeParse({ email, password })
    if (!parsed.success) {
      const fieldErrors: { email?: string; password?: string } = {}
      parsed.error.issues.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message
        if (err.path[0] === 'password') fieldErrors.password = err.message
      })
      setValidationErrors(fieldErrors)
      return
    }

    setLoading(true)

    try {
      const res = await loginUser({ email, password })
      if (res.success) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setError(res.error || 'Invalid credentials.')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Card variant="glass" className={styles.cardContainer}>
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <div>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Save and organize your links in one place</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={validationErrors.email}
          disabled={loading}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={validationErrors.password}
          disabled={loading}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className={styles.submitBtn}
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>

        <p className={styles.footer}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className={styles.link}>
            Create one
          </Link>
        </p>
      </form>
    </Card>
  )
}
