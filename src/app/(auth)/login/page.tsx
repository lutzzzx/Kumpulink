import React from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Login - Kumpulink',
  description: 'Log in to your Kumpulink account to manage your saved links.',
}

export default function LoginPage(): React.JSX.Element {
  return <LoginForm />
}
