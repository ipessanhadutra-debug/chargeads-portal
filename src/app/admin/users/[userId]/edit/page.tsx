'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params?.userId as string

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('••••••••') // hidden
  const [screens, setScreens] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return

      // 1️⃣ Fetch user from public.users
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user:', error)
        return
      }

      setEmail(userData.email)
      setScreens(userData.max_screens)

      // 2️⃣ Fetch Auth user (to get metadata like name, if stored)
      // Optional: If you stored names elsewhere, fetch here
      setName(userData.email.split('@')[0]) // fallback if no name field

      setLoading(false)
    }

    fetchUser()
  }, [userId])

  const handleModify = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // 1️⃣ Update screens in public.users
      const { error } = await supabase
        .from('users')
        .update({ max_screens: screens })
        .eq('id', userId)

      if (error) throw error

      alert('✅ User updated successfully!')
      router.push('/admin/users')
    } catch (error: any) {
      console.error(error)
      alert('❌ Error updating user: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-white text-center mt-10">Loading...</p>

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
          {name}
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleModify}
        className="w-full max-w-2xl bg-white text-black p-6 rounded-b space-y-4"
      >
        <div>
          <label className="block font-semibold mb-1">Name:</label>
          <input
            type="text"
            value={name}
            readOnly
            className="w-full border px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">E-mail:</label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full border px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Password:</label>
          <input
            type="password"
            value={password}
            readOnly
            className="w-full border px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
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
            disabled={saving}
            className="bg-white text-black px-6 py-2 font-semibold rounded hover:bg-yellow-400 transition"
          >
            {saving ? 'Saving...' : 'Modify'}
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
