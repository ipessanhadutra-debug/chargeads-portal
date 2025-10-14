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
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const ADMIN_EMAIL = 'ipessanha@ymail.com'

  useEffect(() => {
    const loadUsers = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const currentUser = authData?.user

      if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
        router.push('/')
        return
      }

      const { data, error } = await supabase.from('users').select('*')
      if (error) console.error('Error fetching users:', error)
      else setUsers(data || [])

      setLoading(false)
    }

    loadUsers()
  }, [router])

  if (loading) return <p className="text-white text-center mt-10">Loading...</p>

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-8 px-4">
      <img src="/chargeads-logo.png" alt="ChargeAds Logo" className="w-64 mb-6" />

      <div className="w-full max-w-4xl">
        <div className="bg-white text-black py-2 px-4 w-40 font-semibold rounded-t">User List</div>
      </div>

      <div className="w-full max-w-4xl bg-white text-black p-4 h-64 overflow-y-auto rounded-b mb-8">
        {users.length === 0 ? (
          <p className="text-center text-gray-500">No customers found.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-1">Email</th>
                <th className="py-1">Screens</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setSelectedUser(u.id)}
                  className={`cursor-pointer hover:bg-gray-200 ${
                    selectedUser === u.id ? 'bg-yellow-200' : ''
                  }`}
                >
                  <td className="py-1">{u.email}</td>
                  <td className="py-1">{u.max_screens}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex space-x-4 w-full max-w-4xl justify-between">
        <button
          onClick={() => router.push('/admin/users/new')}
          className="bg-white text-black px-6 py-2 font-semibold rounded hover:bg-yellow-400 transition"
        >
          Add new
        </button>
        <button
          onClick={() => {
            if (!selectedUser) return alert('Select a user to edit')
            router.push(`/admin/users/${selectedUser}/edit`)
          }}
          className="bg-white text-black px-6 py-2 font-semibold rounded hover:bg-yellow-400 transition"
        >
          Edit
        </button>
        <button
          onClick={() => {
            if (!selectedUser) return alert('Select a user to delete')
            if (confirm('Are you sure?')) {
              supabase.from('users').delete().eq('id', selectedUser).then(() => router.refresh())
            }
          }}
          className="bg-white text-black px-6 py-2 font-semibold rounded hover:bg-red-500 hover:text-white transition"
        >
          Delete
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-white text-black px-6 py-2 font-semibold rounded hover:bg-gray-300 transition"
        >
          Back
        </button>
      </div>
    </div>
  )
}
