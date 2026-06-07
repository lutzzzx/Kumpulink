'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { registerUser } from '@/actions/auth.actions'
import { RegisterSchema } from '@/schemas/auth.schema'
import styles from './RegisterForm.module.css'

export function RegisterForm(): React.JSX.Element {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ name?: string; email?: string; password?: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setValidationErrors({})

    const parsed = RegisterSchema.safeParse({ name, email, password })
    if (!parsed.success) {
      const fieldErrors: { name?: string; email?: string; password?: string } = {}
      parsed.error.issues.forEach((err) => {
        if (err.path[0] === 'name') fieldErrors.name = err.message
        if (err.path[0] === 'email') fieldErrors.email = err.message
        if (err.path[0] === 'password') fieldErrors.password = err.message
      })
      setValidationErrors(fieldErrors)
      return
    }

    setLoading(true)

    try {
      const res = await registerUser({ name, email, password })
      if (res.success) {
        setSuccess('Registration successful! Redirecting to login...')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(res.error || 'Failed to register. Please try again.')
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
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join Kumpulink today to organize your links</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {success && <div className={styles.successAlert}>{success}</div>}

        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={validationErrors.name}
          disabled={loading || !!success}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={validationErrors.email}
          disabled={loading || !!success}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={validationErrors.password}
          disabled={loading || !!success}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className={styles.submitBtn}
          disabled={loading || !!success}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link href="/login" className={styles.link}>
            Sign In
          </Link>
        </p>
      </form>
    </Card>
  )
}
