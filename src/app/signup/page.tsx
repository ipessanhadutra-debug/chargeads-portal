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

    const { data, error } = await supabase.auth.signUp({ email, password })

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
        className="p-8 bg-gray-900 rounded-2xl w-[400px] flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded text-black"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded text-black"
          required
        />
        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-600 text-black p-2 rounded font-semibold"
        >
          Create Account
        </button>
        <p className="text-sm text-center mt-4">{message}</p>
      </form>
    </div>
  )
}
