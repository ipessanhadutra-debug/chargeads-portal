'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('Creating account...')

    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)

    if (error) {
      setMessage(`❌ ${error.message}`)
    } else {
      setMessage('✅ Account created! Redirecting to login...')
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      {/* Logo */}
      <div className="mb-10">
        <Image
          src="/chargeads-logo.png"
          alt="ChargeAds Logo"
          width={256}
          height={80}
          className="mb-6"
        />
      </div>

      {/* Signup Form */}
      <form
        onSubmit={handleSignup}
        className="w-full max-w-xs flex flex-col space-y-4 bg-white text-black rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold text-center mb-2">Sign Up</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded-full transition disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Account'}
        </button>

        <p
          className={`text-sm text-center mt-2 ${
            message.startsWith('✅')
              ? 'text-green-600'
              : message.startsWith('❌')
              ? 'text-red-600'
              : 'text-gray-700'
          }`}
        >
          {message}
        </p>

        <p className="text-center text-sm mt-2">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-yellow-500 hover:underline"
          >
            Log in
          </button>
        </p>
      </form>
    </div>
  )
}
