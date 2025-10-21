'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'

type FileItem = {
  name: string
  url: string
  size?: string
  duration?: string
  rawSize?: number
  rawDuration?: number
}

type SortKey = 'name' | 'size' | 'duration'

export default function ScreenPage() {
  const { screenId } = useParams<{ screenId: string }>()
  const router = useRouter()

  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const MAX_FILE_SIZE = 50 * 1024 * 1024
  const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

  // 📦 Helpers
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')} min`
  }

  // 🧠 Load from Supabase
  useEffect(() => {
    if (!screenId) return

    const loadFiles = async () => {
      const { data, error } = await supabase.storage.from('ads').list(screenId, { limit: 100 })
      if (error) {
        console.error('Error loading files:', error.message)
        setFiles([])
      } else {
        const baseFiles =
          data?.map((f) => ({
            name: f.name,
            rawSize: f.metadata?.size,
            size: f.metadata?.size ? formatSize(f.metadata.size) : undefined,
            url: supabase.storage.from('ads').getPublicUrl(`${screenId}/${f.name}`).data.publicUrl,
          })) || []
        setFiles(baseFiles)

        // Extract durations
        baseFiles.forEach((file, idx) => {
          const video = document.createElement('video')
          video.src = file.url
          video.preload = 'metadata'
          video.onloadedmetadata = () => {
            setFiles((prev) =>
              prev.map((f, i) =>
                i === idx
                  ? {
                      ...f,
                      rawDuration: video.duration,
                      duration: formatDuration(video.duration),
                    }
                  : f
              )
            )
          }
        })
      }
      setLoading(false)
    }

    loadFiles()
  }, [screenId])

  // ✅ File validation
  const validateFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('❌ Invalid file type. Please upload MP4, MOV, or WEBM.')
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('❌ File too large. Max size is 50 MB.')
      return false
    }
    return true
  }

  // ⬆️ Upload
  const handleUpload = async () => {
    if (!selectedFile) return
    if (!validateFile(selectedFile)) return

    setUploading(true)
    const { error } = await supabase.storage
      .from('ads')
      .upload(`${screenId}/${selectedFile.name}`, selectedFile, { upsert: true })
    setUploading(false)

    if (error) {
      alert('Error uploading file: ' + error.message)
    } else {
      alert('✅ File uploaded successfully!')
      window.location.reload()
    }
  }

  // 🗑️ Delete
  const handleDelete = async (fileName: string) => {
    if (!confirm(`Delete ${fileName}?`)) return

    const { error } = await supabase.storage.from('ads').remove([`${screenId}/${fileName}`])
    if (error) {
      alert('Error deleting file: ' + error.message)
    } else {
      alert('✅ File deleted successfully!')
      window.location.reload()
    }
  }

  // 🔽 Sorting logic
  const sortedFiles = [...files].sort((a, b) => {
    let aValue: string | number = ''
    let bValue: string | number = ''
    if (sortKey === 'name') {
      aValue = a.name.toLowerCase()
      bValue = b.name.toLowerCase()
    } else if (sortKey === 'size') {
      aValue = a.rawSize || 0
      bValue = b.rawSize || 0
    } else if (sortKey === 'duration') {
      aValue = a.rawDuration || 0
      bValue = b.rawDuration || 0
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4 relative">
      {/* Logo */}
      <Image
        src="/chargeads-logo.png"
        alt="ChargeAds Logo"
        width={256}
        height={80}
        className="mb-10"
      />

      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <Image src="/tv-icon.png" alt="Screen Icon" width={50} height={50} />
        <h1 className="text-2xl font-bold text-yellow-400">Screen {screenId}</h1>
      </div>

      {/* Files Table */}
      <div className="w-full max-w-4xl bg-zinc-900 rounded-2xl p-6 shadow-lg mb-8">
        <h2 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
          Uploaded Videos
        </h2>

        {loading ? (
          <p className="text-center text-gray-400">Loading files...</p>
        ) : sortedFiles.length === 0 ? (
          <p className="text-center text-gray-400 py-6">No videos uploaded yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-300">
                {(['name', 'duration', 'size'] as SortKey[]).map((key) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className={`cursor-pointer py-2 px-3 font-semibold ${
                      sortKey === key ? 'text-yellow-400' : ''
                    }`}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    {sortKey === key && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                ))}
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedFiles.map((file, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-800 hover:bg-zinc-800 transition"
                >
                  <td className="flex items-center gap-3 py-3 px-3">
                    <video
                      src={file.url}
                      width={80}
                      height={45}
                      className="rounded border border-gray-700 cursor-pointer hover:scale-105 transition-transform"
                      muted
                      preload="metadata"
                      onClick={() => setPreviewUrl(file.url)}
                    />
                    <div>
                      <p className="font-medium">{file.name}</p>
                    </div>
                  </td>
                  <td className="py-3 px-3">{file.duration || '—'}</td>
                  <td className="py-3 px-3">{file.size || '—'}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleDelete(file.name)}
                      className="text-red-400 hover:text-red-500 font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Upload controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-8">
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          className="text-sm text-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded-full file:border-0 file:bg-yellow-500 file:text-black file:font-semibold file:hover:bg-yellow-600 cursor-pointer"
        />
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded-full transition disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      {/* Back button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="bg-white text-black font-semibold py-2 px-8 rounded-full hover:bg-yellow-400 transition"
      >
        Back
      </button>

      {/* Video Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative bg-zinc-900 p-4 rounded-2xl shadow-xl w-[90%] max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={previewUrl}
              controls
              autoPlay
              className="w-full rounded-lg border border-gray-700"
            />
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-3 text-gray-300 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
