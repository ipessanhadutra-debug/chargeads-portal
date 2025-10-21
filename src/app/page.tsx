'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.push('/dashboard')
      }
    }
    checkSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError('Invalid login credentials')
    } else {
      router.push('/dashboard')
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

      {/* Login Form */}
      <form
        onSubmit={handleLogin}
        className="w-full max-w-xs flex flex-col space-y-4"
      >
        <div>
          <label htmlFor="email" className="block mb-1 font-semibold">
            Login:
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-full bg-white text-black outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-1 font-semibold">
            Password:
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-full bg-white text-black outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black font-semibold py-2 rounded-full hover:bg-yellow-400 transition disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* 👇 Add this */}
        <p className="text-center text-sm mt-3">
          Don’t have an account?{' '}
          <button
            type="button"
            onClick={() => router.push('/signup')}
            className="text-yellow-400 hover:underline"
          >
            Sign up
          </button>
        </p>
      </form>
    </div>
  )
}
