'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'

type Screen = {
  id: string
  name: string
  user_id: string
}

type User = {
  id: string
  email: string
  max_screens: number
}

export default function UserScreensPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [screens, setScreens] = useState<Screen[]>([])
  const [loading, setLoading] = useState(true)
  const [newScreenName, setNewScreenName] = useState('')
  const [editingScreen, setEditingScreen] = useState<Screen | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (userError) {
        console.error('Error fetching user:', userError)
        router.push('/admin/users')
        return
      }

      setUser(userData)

      const { data: screenData, error: screenError } = await supabase
        .from('screens')
        .select('*')
        .eq('user_id', id)

      if (screenError) console.error('Error fetching screens:', screenError)
      else setScreens(screenData || [])

      setLoading(false)
    }

    fetchData()
  }, [id, router])

  // 🟨 Add new screen
  const handleAddScreen = async () => {
    if (!user) return
    if (screens.length >= user.max_screens) {
      alert('❌ This user has reached their maximum number of screens.')
      return
    }

    if (!newScreenName.trim()) {
      alert('Enter a screen name.')
      return
    }

    const { data, error } = await supabase
      .from('screens')
      .insert([{ name: newScreenName, user_id: user.id }])
      .select()

    if (error) alert('Error adding screen: ' + error.message)
    else {
      setScreens([...screens, ...(data || [])])
      setNewScreenName('')
    }
  }

  // 🟨 Rename
  const handleRename = async () => {
    if (!editingScreen) return
    if (!editName.trim()) return alert('Enter a new name')

    const { error } = await supabase
      .from('screens')
      .update({ name: editName })
      .eq('id', editingScreen.id)

    if (error) alert('Error renaming screen: ' + error.message)
    else {
      setScreens((prev) =>
        prev.map((s) =>
          s.id === editingScreen.id ? { ...s, name: editName } : s
        )
      )
      setEditingScreen(null)
      setEditName('')
    }
  }

  // 🟥 Delete
  const handleDelete = async (screenId: string) => {
    if (!confirm('Delete this screen?')) return

    const { error } = await supabase.from('screens').delete().eq('id', screenId)
    if (error) alert('Error deleting screen: ' + error.message)
    else setScreens((prev) => prev.filter((s) => s.id !== screenId))
  }

  if (loading)
    return (
      <p className="text-white text-center mt-10">Loading screens...</p>
    )

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

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Screens for {user?.email}</h1>
        <p className="text-gray-400">
          {screens.length} of {user?.max_screens} screens used
        </p>
      </div>

      {/* Screen Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-10 w-full max-w-5xl">
        <AnimatePresence>
          {screens.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">
              No screens found.
            </p>
          ) : (
            screens.map((screen) => (
              <motion.div
                key={screen.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white text-black p-5 rounded-2xl flex flex-col items-center shadow-lg hover:shadow-yellow-400/30 transition relative"
              >
                <Image
                  src="/tv-icon.png"
                  alt="Screen"
                  width={80}
                  height={80}
                  className="mb-3"
                />
                <p className="font-semibold mb-4">{screen.name}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingScreen(screen)
                      setEditName(screen.name)
                    }}
                    className="bg-yellow-500 text-black px-4 py-1 rounded hover:bg-yellow-600 transition"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => handleDelete(screen.id)}
                    className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Screen Input */}
      {user && screens.length < user.max_screens && (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-3xl">
          <input
            type="text"
            placeholder="New screen name"
            value={newScreenName}
            onChange={(e) => setNewScreenName(e.target.value)}
            className="w-full sm:flex-1 p-2 rounded text-black outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button
            onClick={handleAddScreen}
            className="bg-yellow-500 text-black px-6 py-2 rounded font-semibold hover:bg-yellow-600 transition w-full sm:w-auto"
          >
            Add Screen
          </button>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => router.push('/admin/users')}
        className="mt-10 bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-300 transition"
      >
        Back
      </button>

      {/* Rename Modal */}
      {editingScreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setEditingScreen(null)}
        >
          <div
            className="bg-white text-black rounded-xl p-6 w-[90%] max-w-md shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-center">
              Rename Screen
            </h2>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setEditingScreen(null)}
                className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                className="bg-yellow-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-600 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
