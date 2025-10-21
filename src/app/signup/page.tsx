'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setMessage('Creating account...')

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage(`❌ ${error.message}`)
    } else {
      setMessage('✅ Account created! Check your email for confirmation.')
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <form
        onSubmit={handleSignup}
        // 👇 Changed the background to white and text to black
        className="p-8 bg-white text-black rounded-2xl shadow-lg w-[400px] flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-center mb-4 text-black">
          Sign Up
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
          required
        />

        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-600 text-black p-2 rounded font-semibold transition"
        >
          Create Account
        </button>

        <p className="text-sm text-center mt-4 text-gray-700">{message}</p>

        {/* 👇 Add a link to go back to login */}
        <p className="text-sm text-center mt-2">
          Already have an account?{' '}
          <a href="/login" className="text-yellow-500 hover:underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  )
}
