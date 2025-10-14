'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function ScreenPage() {
  const { screenId } = useParams<{ screenId: string }>()
  const router = useRouter()

  // These would later be fetched from your Supabase bucket or DB
  const [files, setFiles] = useState<string[]>(['Ad_1.mp4', 'Ad_2.mp4'])

  const handleUpload = () => {
    alert(`Upload file to screen ${screenId}`)
    // 📝 TODO: integrate Supabase Storage upload here
  }

  const handleDelete = () => {
    alert(`Delete selected file on screen ${screenId}`)
    // 📝 TODO: integrate Supabase file delete here
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

      {/* Screen Header */}
      <div className="flex items-center mb-6 w-full max-w-4xl">
        <Image
          src="/tv-icon.png"
          alt="Screen Icon"
          width={60}
          height={60}
          className="mr-4"
        />
        <h1 className="text-2xl font-bold">Screen {screenId}</h1>
      </div>

      {/* File List */}
      <div className="bg-white text-black rounded w-full max-w-4xl p-4 mb-6">
        <table className="w-full">
          <thead>
            <tr>
              <th className="border-b text-left p-2">File</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <tr>
                <td className="p-4 text-center text-gray-500">
                  No ads files uploaded yet.
                </td>
              </tr>
            ) : (
              files.map((file, idx) => (
                <tr key={idx}>
                  <td className="p-2 border-b">{file}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-white text-black px-6 py-2 rounded hover:bg-gray-300 transition"
        >
          Back
        </button>
        <button
          onClick={handleUpload}
          className="bg-white text-black px-6 py-2 rounded hover:bg-yellow-400 transition"
        >
          Upload File
        </button>
        <button
          onClick={handleDelete}
          className="bg-white text-black px-6 py-2 rounded hover:bg-red-500 hover:text-white transition"
        >
          Delete File
        </button>
      </div>
    </div>
  )
}
