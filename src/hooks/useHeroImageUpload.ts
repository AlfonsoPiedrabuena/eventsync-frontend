'use client'

import { useState } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

interface UploadState {
  uploading: boolean
  progress: number
  error: string | null
}

export function useHeroImageUpload(eventId?: string) {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
  })

  const upload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        const err = 'Formato no permitido. Usa PNG, JPG o WebP.'
        setState(s => ({ ...s, error: err }))
        reject(new Error(err))
        return
      }
      if (file.size > MAX_SIZE_BYTES) {
        const err = 'El archivo supera el límite de 5MB.'
        setState(s => ({ ...s, error: err }))
        reject(new Error(err))
        return
      }

      setState({ uploading: true, progress: 0, error: null })

      const path = eventId
        ? `events/${eventId}/hero`
        : `events/tmp/${Date.now()}_${file.name}`

      const storageRef = ref(storage, path)
      const task = uploadBytesResumable(storageRef, file)

      task.on(
        'state_changed',
        (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          setState(s => ({ ...s, progress: pct }))
        },
        (error) => {
          setState({ uploading: false, progress: 0, error: error.message })
          reject(error)
        },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref)
          setState({ uploading: false, progress: 100, error: null })
          resolve(url)
        }
      )
    })
  }

  return { upload, ...state }
}
