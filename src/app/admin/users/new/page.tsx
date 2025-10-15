'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'

export default function NewUserPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [screens, setScreens] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // STEP 1️⃣ - Create user in Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        })

      if (authError || !authData?.user) {
        throw new Error(authError?.message || 'Failed to create auth user')
      }

      const userId = authData.user.id

      // STEP 2️⃣ - Insert into your public.users table
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: userId,
          email,
          name, // ✅ make sure 'name' column exists in your users table
          max_screens: screens,
        },
      ])

      if (insertError) {
        // 🛑 ROLLBACK - Delete auth user if insert fails
        await supabase.auth.admin.deleteUser(userId)
        throw new Error(insertError.message)
      }

      alert('✅ User created successfully!')
      router.push('/admin/users')
    } catch (err) {
  console.error('❌ Error creating user:', err)
  const message =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
      ? err
      : JSON.stringify(err)
  alert(`❌ Error creating user: ${message}`)
} finally {
  setLoading(false)
}

  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
      {/* Logo */}
      <Image
        src="/chargeads-logo.png"
        alt="ChargeAds Logo"
        width={256}
        height={80}
        className="mb-8"
      />

      <form
        onSubmit={handleCreateUser}
        className="bg-white text-black p-6 rounded shadow w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold mb-4 text-center">New User</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div>
          <label className="block font-semibold mb-1">Name:</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">E-mail:</label>
          <input
            type="email"
            className="w-full border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Password:</label>
          <input
            type="password"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Screens:</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={screens}
            onChange={(e) => setScreens(parseInt(e.target.value, 10))}
            min={1}
          />
        </div>

        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-400 text-black py-2 px-4 rounded hover:bg-gray-500"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`py-2 px-4 rounded ${
              loading
                ? 'bg-yellow-400 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}
