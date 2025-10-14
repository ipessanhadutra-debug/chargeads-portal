'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
      <Image
        src="/chargeads-logo.png"
        alt="ChargeAds Logo"
        width={256}
        height={80}
        className="mb-8"
      />

      <form
        onSubmit={handleChangePassword}
        className="bg-white text-black p-6 rounded-md w-full max-w-sm space-y-4"
      >
        <h2 className="text-xl font-bold text-center mb-2">Change Password</h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm text-center">
            ✅ Password changed successfully!
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:bg-yellow-500 transition"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      <button
        onClick={() => router.push('/dashboard')}
        className="mt-6 bg-white text-black font-semibold py-2 px-6 rounded hover:bg-gray-300 transition"
      >
        Back
      </button>
    </div>
  )
}
