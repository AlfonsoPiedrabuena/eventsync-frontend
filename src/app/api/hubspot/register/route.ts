import { NextRequest, NextResponse } from 'next/server'

const HS_BASE = 'https://api.hubapi.com'
const HS_TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY

// Atribución de unidad de negocio — se inyecta server-side en cada Contact
// creado desde la landing de EventSync. Nunca se expone al cliente ni se acepta
// en el payload del request (no está en RegisterPayload).
const BUSINESS_UNIT = 'Event-Sync'

function hsHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${HS_TOKEN}`,
  }
}

type RegisterPayload = {
  firstname?: string
  lastname?: string
  email?: string
  phone?: string
  company?: string
  crm_que_usas?: string
  acuerdodeprivacidad?: boolean
  turnstileToken?: string
}

export async function POST(req: NextRequest) {
  if (!HS_TOKEN || !TURNSTILE_SECRET) {
    console.error('[hubspot/register] missing env: HUBSPOT_PRIVATE_APP_TOKEN o TURNSTILE_SECRET_KEY')
    return NextResponse.json({ error: 'Servicio no configurado' }, { status: 500 })
  }

  try {
    const body = (await req.json()) as RegisterPayload
    const {
      firstname,
      lastname,
      email,
      phone,
      company,
      crm_que_usas,
      acuerdodeprivacidad,
      turnstileToken,
    } = body

    // ─── 0. Verificar Turnstile ─────────────────────────────────
    if (!turnstileToken) {
      return NextResponse.json(
        { error: 'Verificación de seguridad fallida. Recarga la página e intenta de nuevo.' },
        { status: 403 },
      )
    }

    const turnstileRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: TURNSTILE_SECRET,
          response: turnstileToken,
        }),
      },
    )
    const turnstileData = (await turnstileRes.json()) as { success?: boolean }

    if (!turnstileData.success) {
      return NextResponse.json(
        { error: 'Verificación de seguridad fallida. Recarga la página e intenta de nuevo.' },
        { status: 403 },
      )
    }

    // ─── Validación de campos requeridos ────────────────────────
    if (!email || !firstname || !company) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: email, firstname, company' },
        { status: 400 },
      )
    }

    if (!acuerdodeprivacidad) {
      return NextResponse.json(
        { error: 'Debes aceptar el aviso de privacidad.' },
        { status: 400 },
      )
    }

    // ─── 1. Crear Contacto ───────────────────────────────────────
    const contactRes = await fetch(`${HS_BASE}/crm/objects/2026-03/contacts`, {
      method: 'POST',
      headers: hsHeaders(),
      body: JSON.stringify({
        properties: {
          firstname,
          lastname,
          email,
          hs_whatsapp_phone_number: phone,
          acuerdodeprivacidad: true,
          unidaddenegocio: BUSINESS_UNIT,
          lifecyclestage: 'lead',
        },
      }),
    })

    // Body se lee una sola vez (Response body es stream — no se puede leer dos veces)
    const contactPayload = (await contactRes.json()) as { id?: string; [k: string]: unknown }
    let contactId: string | null = null

    if (contactRes.ok) {
      contactId = contactPayload.id ?? null
    } else if (contactRes.status === 409) {
      // Contacto ya existe — continuar sin id (asociación se omite abajo)
      console.warn('[hubspot/register] contacto ya existe (409), continuando con empresa')
    } else {
      console.error('[hubspot/register] error creando contacto', contactRes.status, contactPayload)
      return NextResponse.json(
        { error: 'Error creando contacto', detail: contactPayload },
        { status: 502 },
      )
    }

    // ─── 2. Crear Empresa ────────────────────────────────────────
    const companyRes = await fetch(`${HS_BASE}/crm/objects/2026-03/companies`, {
      method: 'POST',
      headers: hsHeaders(),
      body: JSON.stringify({
        properties: {
          name: company,
          crm_que_usas,
        },
      }),
    })

    const companyPayload = (await companyRes.json()) as { id?: string; [k: string]: unknown }

    if (!companyRes.ok) {
      console.error('[hubspot/register] error creando empresa', companyRes.status, companyPayload)
      return NextResponse.json(
        { error: 'Error creando empresa', detail: companyPayload },
        { status: 502 },
      )
    }

    const companyId = companyPayload.id ?? null

    // ─── 3. Asociar Contacto → Empresa ──────────────────────────
    // associationTypeId 1 = contact_to_company (HUBSPOT_DEFINED)
    if (contactId && companyId) {
      const assocRes = await fetch(
        `${HS_BASE}/crm/associations/2026-03/contact/company/batch/create`,
        {
          method: 'PUT',
          headers: hsHeaders(),
          body: JSON.stringify({
            inputs: [
              {
                from: { id: contactId },
                to: { id: companyId },
                types: [
                  {
                    associationCategory: 'HUBSPOT_DEFINED',
                    associationTypeId: 1,
                  },
                ],
              },
            ],
          }),
        },
      )
      if (!assocRes.ok) {
        // No bloquea el éxito — el lead ya está en HubSpot, solo falta la liga
        console.warn('[hubspot/register] asociación falló', assocRes.status)
      }
    }

    return NextResponse.json({ success: true, contactId, companyId }, { status: 201 })
  } catch (err) {
    console.error('[hubspot/register]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
