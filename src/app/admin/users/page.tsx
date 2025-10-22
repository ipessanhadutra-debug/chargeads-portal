'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [newMaxScreens, setNewMaxScreens] = useState<number>(1)
  const [currentScreens, setCurrentScreens] = useState<number>(0)

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

  const fetchScreenCount = async (userId: string) => {
    const { count, error } = await supabase
      .from('screens')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) {
      console.error('Error counting screens:', error.message)
      setCurrentScreens(0)
    } else {
      setCurrentScreens(count || 0)
    }
  }

  const handleSave = async () => {
    if (!selectedUser) return

    const { error } = await supabase
      .from('users')
      .update({ max_screens: newMaxScreens })
      .eq('id', selectedUser.id)

    if (error) {
      alert('❌ Error updating user: ' + error.message)
    } else {
      alert('✅ Updated successfully!')
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, max_screens: newMaxScreens } : u
        )
      )
      setEditModalOpen(false)
    }
  }

  if (loading)
    return (
      <p className="text-white text-center mt-10 animate-pulse">
        Loading users...
      </p>
    )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black text-white flex flex-col items-center py-8 px-4 relative"
    >
      {/* Logo */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <Image
          src="/chargeads-logo.png"
          alt="ChargeAds Logo"
          width={256}
          height={80}
          className="mb-10"
        />
      </motion.div>

      {/* Table Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="bg-yellow-500 text-black text-lg font-bold px-6 py-3">
          User List
        </div>

        <div className="p-4 max-h-96 overflow-y-auto text-black">
          {users.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No customers found.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3 text-center">Screens</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <motion.tr
                    key={u.id}
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: '#fff8d6',
                    }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setSelectedUser(u)}
                    className={`cursor-pointer ${
                      selectedUser?.id === u.id ? 'bg-yellow-100' : ''
                    }`}
                  >
                    <td className="py-2 px-3">{u.email}</td>
                    <td className="py-2 px-3 text-center">{u.max_screens}</td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/admin/users/${u.id}/screens`)
                        }}
                        className="bg-yellow-500 text-black font-semibold py-1 px-3 rounded hover:bg-yellow-600 transition"
                      >
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex space-x-4 mt-8"
      >
        <button
          onClick={async () => {
            if (!selectedUser) return alert('Select a user to edit')
            setNewMaxScreens(selectedUser.max_screens)
            await fetchScreenCount(selectedUser.id)
            setEditModalOpen(true)
          }}
          className="bg-yellow-500 text-black font-semibold py-2 px-6 rounded hover:bg-yellow-400 transition"
        >
          Edit
        </button>

        <button
          onClick={() => {
            if (!selectedUser) return alert('Select a user to delete')
            if (confirm('Are you sure you want to delete this user and their screens?')) {
              supabase.from('users').delete().eq('id', selectedUser.id).then(() => router.refresh())
            }
          }}
          className="bg-red-600 text-white font-semibold py-2 px-6 rounded hover:bg-red-500 transition"
        >
          Delete
        </button>

        <button
          onClick={() => router.push('/dashboard')}
          className="bg-gray-300 text-black font-semibold py-2 px-6 rounded hover:bg-gray-400 transition"
        >
          Back
        </button>
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModalOpen && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white text-black rounded-xl p-6 w-[90%] max-w-md shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 text-center text-black">
                Edit User
              </h2>

              <p className="mb-2 font-semibold">Email:</p>
              <p className="mb-4 bg-gray-100 p-2 rounded">{selectedUser.email}</p>

              <label className="block mb-2 font-semibold text-black">
                Max Screens:
              </label>
              <input
                type="number"
                value={newMaxScreens}
                min={1}
                onChange={(e) => setNewMaxScreens(parseInt(e.target.value) || 1)}
                className="w-full p-2 border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-yellow-400 outline-none"
              />

              <p className="text-sm text-gray-600 mb-4 text-center">
                Currently using: <b>{currentScreens}</b> of{' '}
                <b>{selectedUser.max_screens}</b> screens
              </p>

              <div className="flex justify-between">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-yellow-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-600 transition"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
