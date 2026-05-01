import Link from 'next/link'

export const metadata = {
  title: 'Aviso de privacidad — EventSync',
  description: 'Aviso de privacidad de EventSync · Catalysis',
}

export default function AvisoDePrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-1">
        ← Volver al sitio
      </Link>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Aviso de privacidad</h1>
      <p className="text-muted-foreground text-sm mb-10">
        Última actualización: pendiente de publicación
      </p>

      <div className="prose prose-sm max-w-none text-foreground space-y-4">
        <p>
          Este documento describirá próximamente cómo EventSync (operado por Catalysis) recopila,
          utiliza y protege la información personal proporcionada por nuestros usuarios y visitantes.
        </p>
        <p>
          Estamos finalizando la versión definitiva del aviso. Si tienes preguntas sobre el
          tratamiento de tus datos, contáctanos a{' '}
          <a href="mailto:hola@catalysis.mx" className="text-primary hover:underline">
            hola@catalysis.mx
          </a>
          .
        </p>
      </div>
    </div>
  )
}
