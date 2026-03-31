'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CheckinResultCard } from './CheckinResultCard'
import { useCheckinByToken } from '@/hooks/useCheckin'
import type { CheckinResponse } from '@/types'

const SCANNER_ELEMENT_ID = 'qr-scanner-container'
// Pause after a successful scan to show the result before resuming
const RESULT_DISPLAY_MS = 3000

interface QRScannerProps {
  eventId: string
}

export function QRScanner({ eventId }: QRScannerProps) {
  const [isActive, setIsActive] = useState(false)
  const [result, setResult] = useState<CheckinResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<any>(null)
  const pausedRef = useRef(false)
  const checkin = useCheckinByToken(eventId)

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear()
      } catch {
        // html5-qrcode throws if already stopped — safe to ignore
      }
      scannerRef.current = null
    }
    setIsActive(false)
  }

  const startScanner = async () => {
    setResult(null)
    setError(null)
    setIsActive(true)
  }

  // Initialize html5-qrcode when isActive becomes true
  useEffect(() => {
    if (!isActive) return

    let mounted = true

    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      if (!mounted) return

      const scanner = new Html5QrcodeScanner(
        SCANNER_ELEMENT_ID,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false,
      )

      const onScanSuccess = async (decodedText: string) => {
        if (pausedRef.current) return
        pausedRef.current = true

        setResult(null)
        setError(null)

        try {
          const response = await checkin.mutateAsync(decodedText)
          setResult(response)
        } catch (err: any) {
          const msg =
            err?.response?.data?.error?.[0] ??
            err?.response?.data?.error ??
            'Error al procesar el QR.'
          setError(Array.isArray(msg) ? msg[0] : msg)
        } finally {
          // Resume scanning after display delay
          setTimeout(() => {
            pausedRef.current = false
          }, RESULT_DISPLAY_MS)
        }
      }

      scanner.render(onScanSuccess, () => {
        // Scan errors (no QR in frame) are frequent and expected — ignore
      })

      scannerRef.current = scanner
    })

    return () => {
      mounted = false
      stopScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isActive ? 'Apunta la cámara al código QR del asistente.' : 'Activa la cámara para escanear.'}
        </p>
        <Button
          variant={isActive ? 'outline' : 'default'}
          size="sm"
          onClick={isActive ? stopScanner : startScanner}
        >
          {isActive ? (
            <>
              <CameraOff className="h-4 w-4 mr-1" />
              Detener
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-1" />
              Activar cámara
            </>
          )}
        </Button>
      </div>

      {/* html5-qrcode renders into this element */}
      <div
        id={SCANNER_ELEMENT_ID}
        className={isActive ? 'rounded-lg overflow-hidden border' : 'hidden'}
      />

      {!isActive && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-muted-foreground gap-2">
          <Camera className="h-10 w-10 opacity-30" />
          <p className="text-sm">Cámara inactiva</p>
        </div>
      )}

      <CheckinResultCard result={result} error={error} />
    </div>
  )
}
