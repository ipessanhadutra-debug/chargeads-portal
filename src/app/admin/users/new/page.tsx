'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function NewUserPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [screens, setScreens] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, screens }),
      })

      const data: { error?: string; success?: boolean } = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
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

      {/* Form */}
      <form
        onSubmit={handleCreateUser}
        className="bg-white text-black p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-xl font-bold mb-2 text-center">New User</h1>

        <div>
          <label className="block text-sm font-semibold mb-1">Name:</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">E-mail:</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Password:</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Screens:</label>
          <input
            type="number"
            min={1}
            className="w-full border px-3 py-2 rounded"
            value={screens}
            onChange={(e) => setScreens(parseInt(e.target.value, 10))}
            required
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500 transition"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-500 text-black font-semibold py-2 px-4 rounded hover:bg-yellow-600 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}
