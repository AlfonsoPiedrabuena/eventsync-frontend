'use client'

import { useRef, useState, type FormEvent } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import styles from '@/styles/landing.module.css'

type FormData = {
  firstname: string
  lastname: string
  email: string
  phone: string
  company: string
  crm_que_usas: string
  acuerdodeprivacidad: boolean
}

const INITIAL_FORM: FormData = {
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  company: '',
  crm_que_usas: '',
  acuerdodeprivacidad: false,
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

export function HubSpotRegisterForm() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!turnstileToken) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/hubspot/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, turnstileToken }),
      })

      if (!res.ok) throw new Error('request failed')
      setSuccess(true)
    } catch {
      setError('Hubo un error. Por favor intenta de nuevo.')
      // Token invalidado tras intento fallido — pedir uno fresco
      turnstileRef.current?.reset()
      setTurnstileToken(null)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.successCard} role="status" aria-live="polite">
        <div className={styles.successCheck}>✓</div>
        <p className={styles.successText}>¡Listo! Nos pondremos en contacto contigo pronto.</p>
        <p className={styles.successSub}>
          Recibirás un correo de confirmación en los próximos minutos.
        </p>
      </div>
    )
  }

  const submitDisabled = !turnstileToken || loading

  return (
    <form className={styles.regCard} onSubmit={handleSubmit} noValidate={false}>
      <div className={styles.frow}>
        <div>
          <label htmlFor="firstname" className={styles.flabel}>
            Nombre
          </label>
          <input
            id="firstname"
            name="firstname"
            type="text"
            className={styles.finput}
            placeholder="Tu nombre"
            value={formData.firstname}
            onChange={handleChange}
            required
            autoComplete="given-name"
          />
        </div>
        <div>
          <label htmlFor="lastname" className={styles.flabel}>
            Apellido
          </label>
          <input
            id="lastname"
            name="lastname"
            type="text"
            className={styles.finput}
            placeholder="Tu apellido"
            value={formData.lastname}
            onChange={handleChange}
            autoComplete="family-name"
          />
        </div>
      </div>

      <label htmlFor="email" className={styles.flabel}>
        Correo de contacto
      </label>
      <input
        id="email"
        name="email"
        type="email"
        className={styles.finput}
        placeholder="tu@empresa.com"
        value={formData.email}
        onChange={handleChange}
        required
        autoComplete="email"
      />

      <label htmlFor="phone" className={styles.flabel}>
        WhatsApp
      </label>
      <input
        id="phone"
        name="phone"
        type="tel"
        className={styles.finput}
        placeholder="+52 55 1234 5678"
        value={formData.phone}
        onChange={handleChange}
        autoComplete="tel"
      />

      <label htmlFor="company" className={styles.flabel}>
        Organización
      </label>
      <input
        id="company"
        name="company"
        type="text"
        className={styles.finput}
        placeholder="Nombre de tu empresa"
        value={formData.company}
        onChange={handleChange}
        required
        autoComplete="organization"
      />

      <label htmlFor="crm_que_usas" className={styles.flabel}>
        CRM que usas
      </label>
      <select
        id="crm_que_usas"
        name="crm_que_usas"
        className={`${styles.finput} ${styles.finputSelect}`}
        value={formData.crm_que_usas}
        onChange={handleChange}
      >
        <option value="">Selecciona tu CRM…</option>
        <option value="HubSpot">HubSpot</option>
        <option value="Salesforce">Salesforce</option>
        <option value="Pipedrive">Pipedrive</option>
        <option value="Otro">Otro</option>
        <option value="No usamos CRM aún">No usamos CRM aún</option>
      </select>

      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          name="acuerdodeprivacidad"
          required
          checked={formData.acuerdodeprivacidad}
          onChange={handleChange}
        />
        <span>
          Acepto el{' '}
          <a
            href="/aviso-de-privacidad"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.privacyLink}
          >
            aviso de privacidad
          </a>
        </span>
      </label>

      <div className={styles.turnstileSlot}>
        {TURNSTILE_SITE_KEY ? (
          <Turnstile
            ref={turnstileRef}
            siteKey={TURNSTILE_SITE_KEY}
            onSuccess={(token) => setTurnstileToken(token)}
            onError={() => setTurnstileToken(null)}
            onExpire={() => setTurnstileToken(null)}
            options={{ theme: 'light' }}
          />
        ) : null}
      </div>

      <button type="submit" className={styles.fsubmit} disabled={submitDisabled}>
        {loading ? 'Enviando…' : 'Crear mi organización gratis →'}
      </button>

      {error && <p className={styles.errorMsg}>{error}</p>}
    </form>
  )
}
