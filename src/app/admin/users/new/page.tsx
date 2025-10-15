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
  const [screens, setScreens] = useState<number>(1)
  const [loading, setLoading] = useState(false)

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1️⃣ Create user in Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw new Error(signUpError.message)
      const authUser = signUpData.user
      if (!authUser) throw new Error('Failed to create auth user.')

      // 2️⃣ Insert into your "users" table with Auth ID
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: authUser.id,   // 👈 this is crucial to avoid duplicate pkey
            email,
            name,
          },
        ])

      if (insertError) throw new Error(insertError.message)

      // 3️⃣ Optionally create screens for this user
      for (let i = 1; i <= screens; i++) {
        const screenName = `Screen ${i}`
        const { error: screenError } = await supabase
          .from('screens')
          .insert([{ name: screenName, user_id: authUser.id }])

        if (screenError) throw new Error(screenError.message)
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
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-8 px-4">
      {/* Logo */}
      <Image
        src="/chargeads-logo.png"
        alt="ChargeAds Logo"
        width={256}
        height={80}
        className="mb-8"
      />

      {/* Form */}
      <form
        onSubmit={handleCreateUser}
        className="bg-white text-black p-6 rounded w-full max-w-md space-y-4"
      >
        <h2 className="text-lg font-bold mb-4">New User</h2>

        <div>
          <label className="block font-semibold mb-1">Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">E-mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Screens:</label>
          <input
            type="number"
            value={screens}
            min={1}
            onChange={(e) => setScreens(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={() => router.push('/admin/users')}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}
