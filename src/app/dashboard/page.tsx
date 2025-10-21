'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Screen = {
  id: string
  name: string
  user_id: string
}

type UserRecord = {
  id: string
  email: string
  max_screens?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [screens, setScreens] = useState<Screen[]>([])
  const [userRecord, setUserRecord] = useState<UserRecord | null>(null)
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

      // Get public.users info (max_screens)
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      setUserRecord(userData ?? null)

      // Fetch user's screens (if not admin)
      if (user.email !== ADMIN_EMAIL) {
        const { data: screenData, error } = await supabase
          .from('screens')
          .select('*')
          .eq('user_id', user.id)

        if (error) {
          console.error('Error fetching screens:', error)
        } else {
          setScreens(screenData || [])
        }
      }

      setLoading(false)
    }

    loadUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleAddScreen = async () => {
    if (!userRecord) return alert('User not found.')

    // Check screen limit
    if (screens.length >= (userRecord.max_screens ?? 0)) {
      alert('⚠️ You have reached your maximum number of screens.')
      return
    }

    const name = prompt('Enter a name for your new screen:')
    if (!name) return

    const { error } = await supabase.from('screens').insert([
      {
        user_id: userRecord.id,
        name,
      },
    ])

    if (error) {
      alert('Error adding screen: ' + error.message)
    } else {
      alert('✅ Screen added successfully!')
      window.location.reload()
    }
  }

  if (loading) return <p className="text-white text-center mt-10">Loading...</p>

  // 👑 ADMIN VIEW
  if (email === ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
        <Image
          src="/chargeads-logo.png"
          alt="ChargeAds Logo"
          width={256}
          height={80}
          className="mb-6"
        />

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

 // 👤 CUSTOMER VIEW
return (
  <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
    {/* Logo */}
    <Image
      src="/chargeads-logo.png"
      alt="ChargeAds Logo"
      width={256}
      height={80}
      className="mb-10"
    />

    {/* Screens Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-10">
      {screens.length === 0 ? (
        <p>No screens found.</p>
      ) : (
        screens.map((screen) => (
          <div
            key={screen.id}
            onClick={() => router.push(`/dashboard/screens/${screen.id}`)}
            className="flex flex-col items-center cursor-pointer group"
          >
            <Image
              src="/tv-icon.png"
              alt="Screen Icon"
              width={100}
              height={100}
              className="group-hover:scale-105 transition"
            />
            <p className="mt-2 font-semibold">{screen.name}</p>
          </div>
        ))
      )}
    </div>

    {/* Only show Add Screen button if under max_screens */}
    {screens.length < (userRecord?.max_screens ?? 0) && (
      <button
        onClick={async () => {
          const name = prompt('Enter a name for your new screen:')
          if (!name) return

          const { error } = await supabase.from('screens').insert([
            {
              user_id: userRecord?.id,
              name,
            },
          ])

          if (error) {
            alert('Error adding screen: ' + error.message)
          } else {
            alert('✅ Screen added successfully!')
            window.location.reload()
          }
        }}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded-full transition mb-4"
      >
        + Add Screen
      </button>
    )}

    {/* Actions */}
    <div className="flex flex-col space-y-3 w-full max-w-xs">
      <button
        onClick={() => router.push('/change-password')}
        className="bg-white text-black font-semibold py-2 rounded hover:bg-yellow-400 transition"
      >
        Change Password
      </button>

      <button
        onClick={handleLogout}
        className="bg-white text-black font-semibold py-2 rounded hover:bg-red-500 hover:text-white transition"
      >
        Logout
      </button>
    </div>
  </div>
)
}
