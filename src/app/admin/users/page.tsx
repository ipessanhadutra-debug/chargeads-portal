'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type UserRow = {
  id: string
  email: string
  max_screens: number
  created_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const ADMIN_EMAIL = 'ipessanha@ymail.com' // 👈 your admin email

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const currentUser = userData?.user

      // 🚫 Redirect if not admin
      if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
        router.push('/')
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
      } else {
        setUsers(data || [])
      }

      setLoading(false)
    }

    fetchUsers()
  }, [router])

  const handleGoToScreens = (userId: string) => {
    router.push(`/admin/users/${userId}/screens`)
  }

  if (loading) return <p className="text-white text-center mt-10">Loading...</p>

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">👑 Manage Users</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-white text-black px-4 py-2 rounded hover:bg-yellow-400 transition"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-800 text-left">
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Max Screens</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-gray-400">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.max_screens}</td>
                  <td className="px-4 py-2">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleGoToScreens(u.id)}
                      className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500 transition"
                    >
                      Manage Screens
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
