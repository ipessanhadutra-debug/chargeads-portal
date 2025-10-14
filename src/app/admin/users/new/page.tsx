'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

      if (signUpError) throw signUpError
      if (!signUpData?.user) throw new Error('User not created.')

      const newUserId = signUpData.user.id

      // 2️⃣ Insert into public.users table
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: newUserId,
          email,
          max_screens: screens,
        },
      ])

      if (insertError) throw insertError

      // 3️⃣ Automatically create screens for the new user
      const screenRecords = Array.from({ length: screens }, (_, i) => ({
        user_id: newUserId,
        name: `Screen ${i + 1}`,
      }))

      const { error: screenError } = await supabase
        .from('screens')
        .insert(screenRecords)

      if (screenError) throw screenError

      alert('✅ New user and screens created successfully!')
      router.push('/admin/users')
    } catch (error: any) {
      console.error(error)
      alert('❌ Error creating user: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-8 px-4">
      {/* Logo */}
      <img
        src="/chargeads-logo.png"
        alt="ChargeAds Logo"
        className="w-64 mb-6"
      />

      {/* Header tab */}
      <div className="w-full max-w-2xl">
        <div className="bg-white text-black py-2 px-4 w-40 font-semibold rounded-t">
          New User
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleCreateUser}
        className="w-full max-w-2xl bg-white text-black p-6 rounded-b space-y-4"
      >
        <div>
          <label className="block font-semibold mb-1">Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">E-mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Screens:</label>
          <input
            type="number"
            value={screens}
            onChange={(e) => setScreens(Number(e.target.value))}
            min={1}
            className="w-full border px-3 py-2"
          />
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black px-6 py-2 font-semibold rounded hover:bg-yellow-400 transition"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/users')}
            className="bg-white text-black px-6 py-2 font-semibold rounded hover:bg-gray-300 transition"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  )
}
