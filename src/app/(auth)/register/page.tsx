import React from 'react'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata = {
  title: 'Register - Kumpulink',
  description: 'Create a Kumpulink account to start saving and auto-grouping links.',
}

export default function RegisterPage(): React.JSX.Element {
  return <RegisterForm />
}
