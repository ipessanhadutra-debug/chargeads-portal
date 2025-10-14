'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function DashboardPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const ADMIN_EMAIL = 'ipessanha@ymail.com' // 👈 your admin email

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if (!user) {
        router.push('/')
        return
      }

      setEmail(user.email ?? null)
      setLoading(false)
    }

    loadUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <p className="text-white text-center mt-10">Loading...</p>

  // 🧠 If Admin
  if (email === ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
        {/* Logo */}
        <Image
          src="/chargeads-logo.png"
          alt="ChargeAds Logo"
          width={256}
          height={80}
          className="mb-6"
         />

        {/* Buttons */}
        <div className="flex flex-col space-y-4 w-full max-w-xs">
          <button
            onClick={() => router.push('/admin/users')}
            className="bg-white text-black font-semibold py-3 rounded hover:bg-yellow-400 transition"
          >
            User List
          </button>
          <button
            onClick={handleLogout}
            className="bg-white text-black font-semibold py-3 rounded hover:bg-red-500 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  // ✨ Else (Customer view)
  return <p className="text-white text-center mt-10">Customer Dashboard goes here...</p>
}
