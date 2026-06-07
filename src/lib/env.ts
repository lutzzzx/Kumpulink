import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  CRON_SECRET: z.string().optional(),
})

// In Next.js, on the client side, process.env is empty except for NEXT_PUBLIC_ variables.
// So we should only run this validation on the server side.
export let env: z.infer<typeof envSchema>

if (typeof window === 'undefined') {
  env = envSchema.parse(process.env)
} else {
  // Client side fallback for public variables
  env = {
    DATABASE_URL: '',
    AUTH_SECRET: '',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  }
}
