import Link from 'next/link'
import { GeistSans } from 'geist/font/sans'
import styles from '@/styles/landing.module.css'
import { LogoMark } from './LogoMark'
import { HubSpotRegisterForm } from './HubSpotRegisterForm'

export function LandingPage() {
  return (
    <div className={`${GeistSans.className} ${styles.landingRoot}`}>
      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <LogoMark className={styles.logoMark} />
          EventSync
        </div>
        <div className={styles.navLinks}>
          <a href="#para-quien">¿Para quién?</a>
          <a href="#diferencia">La diferencia</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#funcionalidades">Funcionalidades</a>
        </div>
        <div className={styles.navRight}>
          <Link href="/login" className={styles.navLogin}>
            Iniciar sesión
          </Link>
          <a href="#registro" className={styles.navBtn}>
            Solicitar acceso
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGridBg} />
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <div>
            <div className={styles.heroChip}>
              <div className={styles.chipDot} />
              Gestión de eventos corporativos
            </div>
            <h1 className={styles.heroH1}>
              Tus eventos,
              <br />
              <span>
                convertidos en
                <br />
                oportunidades.
              </span>
            </h1>
            <p className={styles.heroSub}>
              EventSync es la plataforma que los equipos de marketing y ventas usan para organizar
              eventos corporativos, capturar asistentes y convertirlos en pipeline — integrado
              directamente con HubSpot y Salesforce.
            </p>
            <div className={styles.heroBtns}>
              <a href="#registro" className={styles.btnHeroPrimary}>
                Comenzar gratis →
              </a>
              <a href="#como-funciona" className={styles.btnHeroGhost}>
                Ver cómo funciona
              </a>
            </div>
          </div>

          <div className={styles.hcard}>
            <div className={styles.hcardHeader}>
              <span className={styles.hcardHeaderTitle}>Demo Day · Catalysis · 14:00 hrs</span>
              <span className={styles.liveBadge}>En vivo</span>
            </div>
            <div className={styles.hcardBody}>
              <div className={styles.hcardRow}>
                <span className={styles.hcardRowLabel}>Registros confirmados</span>
                <span className={styles.hcardRowVal}>142</span>
              </div>
              <div className={styles.hcardRow}>
                <span className={styles.hcardRowLabel}>Check-ins completados</span>
                <span className={`${styles.hcardRowVal} ${styles.green}`}>118 · 83%</span>
              </div>
              <div className={styles.hcardRow}>
                <span className={styles.hcardRowLabel}>Sincronizados en HubSpot</span>
                <span className={`${styles.hcardRowVal} ${styles.blue}`}>118 →</span>
              </div>
              <div className={styles.hcardRow}>
                <span className={styles.hcardRowLabel}>Follow-ups enviados</span>
                <span className={`${styles.hcardRowVal} ${styles.green}`}>118 ✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF */}
      <div className={styles.proof}>
        <div className={styles.proofItem}>
          <span className={styles.proofDot}>◆</span> Un producto de <strong>Catalysis</strong>
        </div>
        <div className={styles.proofSep} />
        <div className={styles.proofItem}>
          <span className={styles.proofDot}>◆</span> Integración nativa con <strong>HubSpot</strong>
        </div>
        <div className={styles.proofSep} />
        <div className={styles.proofItem}>
          <span className={styles.proofDot}>◆</span> Check-in por <strong>código QR</strong>
        </div>
        <div className={styles.proofSep} />
        <div className={styles.proofItem}>
          <span className={styles.proofDot}>◆</span> Eventos{' '}
          <strong>presenciales, virtuales e híbridos</strong>
        </div>
      </div>

      {/* PARA QUIÉN */}
      <section id="para-quien" className={styles.section}>
        <div className={styles.si}>
          <div className={styles.secBadge}>
            <div className={styles.secBadgeLine} />
            ¿Para quién es EventSync?
          </div>
          <h2 className={styles.secH2}>
            Hecho para equipos que generan
            <br />
            negocio con eventos.
          </h2>
          <p className={styles.secSub}>
            EventSync no es para vender boletos de conciertos. Es la herramienta que los equipos B2B
            necesitan para convertir cada evento en inteligencia de negocio.
          </p>

          <div className={styles.personas}>
            <div className={styles.pcard}>
              <div className={styles.picon}>
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className={styles.prole}>Perfil 01</div>
              <div className={styles.pname}>Directora de Marketing</div>
              <p className={styles.pdesc}>
                Organiza webinars, conferencias y eventos de marca para generar leads calificados.
                Necesita datos, no solo inscritos.
              </p>
              <div className={styles.ppains}>
                <div className={styles.ppain}>
                  <div className={styles.ppainCheck}>✓</div>
                  <span>Quiere saber quiénes asistieron y cuáles son oportunidades reales</span>
                </div>
                <div className={styles.ppain}>
                  <div className={styles.ppainCheck}>✓</div>
                  <span>Necesita que los asistentes lleguen a HubSpot sin trabajo manual</span>
                </div>
                <div className={styles.ppain}>
                  <div className={styles.ppainCheck}>✓</div>
                  <span>Reporta ROI del evento al equipo directivo</span>
                </div>
              </div>
            </div>

            <div className={styles.pcard}>
              <div className={styles.picon}>
                <svg viewBox="0 0 24 24" aria-hidden>
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className={styles.prole}>Perfil 02</div>
              <div className={styles.pname}>Coordinador de Eventos</div>
              <p className={styles.pdesc}>
                Gestiona la operación completa: invitaciones, confirmaciones, logística del día y
                seguimiento post-evento.
              </p>
              <div className={styles.ppains}>
                <div className={styles.ppain}>
                  <div className={styles.ppainCheck}>✓</div>
                  <span>Necesita check-in sin papel ni hojas de Excel</span>
                </div>
                <div className={styles.ppain}>
                  <div className={styles.ppainCheck}>✓</div>
                  <span>Quiere un dashboard en tiempo real el día del evento</span>
                </div>
                <div className={styles.ppain}>
                  <div className={styles.ppainCheck}>✓</div>
                  <span>Envía confirmaciones y recordatorios automáticamente</span>
                </div>
              </div>
            </div>

            <div className={styles.pcard}>
              <div className={styles.picon}>
                <svg viewBox="0 0 24 24" aria-hidden>
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div className={styles.prole}>Perfil 03</div>
              <div className={styles.pname}>Gerente de Ventas</div>
              <p className={styles.pdesc}>
                Usa eventos como herramienta de prospección y cierre. Los demos, road shows y
                networking son su motor de pipeline.
              </p>
              <div className={styles.ppains}>
                <div className={styles.ppain}>
                  <div className={styles.ppainCheck}>✓</div>
                  <span>Quiere ver qué contactos del CRM asistieron a cada evento</span>
                </div>
                <div className={styles.ppain}>
                  <div className={styles.ppainCheck}>✓</div>
                  <span>Necesita que la asistencia quede en el timeline de Salesforce</span>
                </div>
                <div className={styles.ppain}>
                  <div className={styles.ppainCheck}>✓</div>
                  <span>Automatiza el follow-up 24 horas después del evento</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIFERENCIACIÓN */}
      <section id="diferencia" className={`${styles.section} ${styles.diffBg}`}>
        <div className={styles.si}>
          <div className={styles.secBadge}>
            <div className={styles.secBadgeLine} />
            EventSync vs el resto
          </div>
          <h2 className={styles.secH2}>
            Eventbrite y otras plataformas
            <br />
            no son tu herramienta.
          </h2>
          <p className={styles.secSub}>
            Son plataformas de venta de boletos al público general. EventSync está construido para
            equipos corporativos que usan eventos como canal de negocio.
          </p>

          <div className={styles.diffCols}>
            <div className={`${styles.dcol} ${styles.them}`}>
              <div className={`${styles.dcolHead} ${styles.them}`}>Eventbrite y otras</div>
              <div className={styles.drow}>
                <span className={styles.dx}>✗</span> Pensado para el público general (conciertos, teatro, circos)
              </div>
              <div className={styles.drow}>
                <span className={styles.dx}>✗</span> Cobra comisión por cada boleto vendido
              </div>
              <div className={styles.drow}>
                <span className={styles.dx}>✗</span> Sin integración con HubSpot o Salesforce
              </div>
              <div className={styles.drow}>
                <span className={styles.dx}>✗</span> No sabes quién asistió realmente
              </div>
              <div className={styles.drow}>
                <span className={styles.dx}>✗</span> Todos los eventos son públicos en su marketplace
              </div>
              <div className={styles.drow}>
                <span className={styles.dx}>✗</span> Sin automatizaciones de follow-up post-evento
              </div>
              <div className={styles.drow}>
                <span className={styles.dx}>✗</span> Tu base de datos de asistentes es de ellos, no tuya
              </div>
            </div>
            <div className={`${styles.dcol} ${styles.us}`}>
              <div className={`${styles.dcolHead} ${styles.us}`}>EventSync</div>
              <div className={styles.drow}>
                <span className={styles.dv}>✓</span> Construido para marketing y ventas B2B
              </div>
              <div className={styles.drow}>
                <span className={styles.dv}>✓</span> Suscripción fija — sin comisiones por registro
              </div>
              <div className={styles.drow}>
                <span className={styles.dv}>✓</span> Sync bidireccional nativo con HubSpot y Salesforce
              </div>
              <div className={styles.drow}>
                <span className={styles.dv}>✓</span> Check-in QR: sabes exactamente quién llegó
              </div>
              <div className={styles.drow}>
                <span className={styles.dv}>✓</span> Eventos privados o públicos, tú decides
              </div>
              <div className={styles.drow}>
                <span className={styles.dv}>✓</span> Emails automáticos de confirmación, recordatorio y follow-up
              </div>
              <div className={styles.drow}>
                <span className={styles.dv}>✓</span> Todos los datos son tuyos, en tu instancia
              </div>
            </div>
          </div>

          <div className={styles.vstableWrap}>
            <table className={styles.vstable}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>Eventbrite</th>
                  <th>Hopin / Bizzabo</th>
                  <th className={styles.usCol}>EventSync</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Objetivo principal</td>
                  <td>Venta de boletos</td>
                  <td>Eventos virtuales</td>
                  <td className={styles.usCol}>Revenue ops · CRM sync</td>
                </tr>
                <tr>
                  <td>Integración CRM nativa</td>
                  <td><span className={styles.ix}>✗</span></td>
                  <td><span className={styles.ip}>Parcial</span></td>
                  <td className={styles.usCol}>
                    <span className={styles.ic}>✓</span> HubSpot + Salesforce
                  </td>
                </tr>
                <tr>
                  <td>Check-in QR en tiempo real</td>
                  <td><span className={styles.ip}>Básico</span></td>
                  <td><span className={styles.ix}>✗</span></td>
                  <td className={styles.usCol}>
                    <span className={styles.ic}>✓</span> Con analytics
                  </td>
                </tr>
                <tr>
                  <td>Modelo de cobro</td>
                  <td>% por boleto</td>
                  <td>$$ enterprise</td>
                  <td className={styles.usCol}>Suscripción plana</td>
                </tr>
                <tr>
                  <td>Multi-tenant / agencias</td>
                  <td><span className={styles.ix}>✗</span></td>
                  <td><span className={styles.ix}>✗</span></td>
                  <td className={styles.usCol}>
                    <span className={styles.ic}>✓</span> Nativo
                  </td>
                </tr>
                <tr>
                  <td>IA generativa integrada</td>
                  <td><span className={styles.ix}>✗</span></td>
                  <td><span className={styles.ix}>✗</span></td>
                  <td className={styles.usCol}>
                    <span className={styles.ic}>✓</span> Roadmap Q3 2026
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className={styles.section}>
        <div className={styles.si}>
          <div className={styles.secBadge}>
            <div className={styles.secBadgeLine} />
            Paso a paso
          </div>
          <h2 className={styles.secH2}>
            De cero a tu primer evento
            <br />
            en menos de 10 minutos.
          </h2>
          <p className={styles.secSub}>
            Sin instalaciones, sin configuración técnica. Tu organización y tu primer evento, listos
            hoy.
          </p>

          <div className={styles.stepsRow}>
            <div className={styles.stepsLine} />
            <div className={styles.step}>
              <div className={`${styles.stepNum} ${styles.on}`}>01</div>
              <div className={styles.stepTitle}>Registra tu organización</div>
              <p className={styles.stepDesc}>
                Crea tu cuenta de administrador y el espacio de trabajo de tu empresa en menos de 2
                minutos. Sin tarjeta de crédito.
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>02</div>
              <div className={styles.stepTitle}>Crea y publica tu evento</div>
              <p className={styles.stepDesc}>
                Nombre, fecha, modalidad y listo. Tu evento tiene página de registro única lista
                para compartir con tus invitados.
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>03</div>
              <div className={styles.stepTitle}>Gestiona asistentes y check-in</div>
              <p className={styles.stepDesc}>
                Cada asistente recibe un QR único. El día del evento, escaneas y sabes exactamente
                quién llegó en tiempo real.
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>04</div>
              <div className={styles.stepTitle}>Sincroniza con tu CRM</div>
              <p className={styles.stepDesc}>
                Todos los asistentes llegan automáticamente a HubSpot o Salesforce con su historial
                de asistencia.
              </p>
            </div>
          </div>

          <div className={styles.stepsBanner}>
            <p className={styles.stepsBannerText}>
              ¿Tienes un evento en los próximos 30 días?{' '}
              <span>Úsalo para hacer tu primera prueba, gratis.</span>
            </p>
            <a href="#registro" className={styles.btnSolid}>
              Registrarme ahora →
            </a>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="funcionalidades" className={`${styles.section} ${styles.featBg}`}>
        <div className={styles.si}>
          <div className={styles.secBadge}>
            <div className={styles.secBadgeLine} />
            Lo que incluye EventSync
          </div>
          <h2 className={styles.secH2}>
            Todo lo que necesitas,
            <br />
            nada de lo que sobra.
          </h2>
          <p className={styles.secSub}>
            Cada funcionalidad fue diseñada pensando en equipos que usan eventos como canal de
            negocio.
          </p>

          <div className={styles.feats}>
            <div className={styles.fcard}>
              <div className={styles.ficon}>
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </div>
              <div className={styles.ftitle}>Registro de asistentes</div>
              <p className={styles.fdesc}>
                Formularios con campos custom según el tipo de evento. Confirmación automática por
                correo y QR único para cada asistente.
              </p>
              <span className={styles.ftag}>Core</span>
            </div>
            <div className={styles.fcard}>
              <div className={styles.ficon}>
                <svg viewBox="0 0 24 24" aria-hidden>
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <div className={styles.ftitle}>Check-in QR en tiempo real</div>
              <p className={styles.fdesc}>
                Escanea el QR del asistente con cualquier dispositivo. Dashboard con conteo en vivo,
                no-shows y tasa de asistencia.
              </p>
              <span className={styles.ftag}>Core</span>
            </div>
            <div className={styles.fcard}>
              <div className={styles.ficon}>
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className={styles.ftitle}>Integración con HubSpot y Salesforce</div>
              <p className={styles.fdesc}>
                Sync bidireccional de contactos y asistencia. La información del evento aparece en
                el timeline de cada contacto del CRM.
              </p>
              <span className={styles.ftag}>CRM</span>
            </div>
            <div className={styles.fcard}>
              <div className={styles.ficon}>
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className={styles.ftitle}>Comunicaciones automáticas</div>
              <p className={styles.fdesc}>
                Confirmación de registro, recordatorios pre-evento y follow-up post-evento. Todo
                enviado sin intervención manual.
              </p>
              <span className={styles.ftag}>Automatización</span>
            </div>
            <div className={styles.fcard}>
              <div className={styles.ficon}>
                <svg viewBox="0 0 24 24" aria-hidden>
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div className={styles.ftitle}>Analytics e inteligencia</div>
              <p className={styles.fdesc}>
                Tasa de conversión, no-shows, segmentación de asistentes y comparativa entre
                eventos. Todo exportable.
              </p>
              <span className={styles.ftag}>Analytics</span>
            </div>
            <div className={styles.fcard}>
              <div className={styles.ficon}>
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className={styles.ftitle}>Multi-tenant para agencias</div>
              <p className={styles.fdesc}>
                Gestiona múltiples organizaciones clientes desde una sola instancia. Datos aislados,
                branding por cuenta, control total.
              </p>
              <span className={styles.ftag}>Enterprise</span>
            </div>
          </div>
        </div>
      </section>

      {/* REGISTRO */}
      <section id="registro" className={`${styles.section} ${styles.ctaBg}`}>
        <div className={styles.ctaInner}>
          <div className={styles.secBadge} style={{ justifyContent: 'center', color: '#93c5fd' }}>
            <div className={styles.secBadgeLine} style={{ background: '#93c5fd' }} />
            Acceso anticipado · Gratis
          </div>
          <h2 className={styles.ctaH2}>
            Tu próximo evento,
            <br />
            <span>con datos reales.</span>
          </h2>
          <p className={styles.ctaSub}>
            Registra tu organización hoy. Sin costo, sin tarjeta de crédito. Empieza con tu primer
            evento y ve la diferencia en la primera semana.
          </p>

          <HubSpotRegisterForm />

          <div className={styles.trust}>
            <div className={styles.trustItem}>
              <div className={styles.trustCk}>✓</div>Sin tarjeta de crédito
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustCk}>✓</div>Tus datos son tuyos
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustCk}>✓</div>Cancela cuando quieras
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustCk}>✓</div>Soporte en español
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerLeft}>
          <LogoMark className={styles.footerLogomark} />
          <span className={styles.footerName}>EventSync</span>
          <span>
            · Un producto de{' '}
            <a href="https://catalysis.mx" target="_blank" rel="noopener noreferrer">
              Catalysis
            </a>
          </span>
        </div>
        <div className={styles.footerLinks}>
          <a href="https://eventsync.cloud">eventsync.cloud</a>
          <a href="mailto:hola@catalysis.mx">hola@catalysis.mx</a>
        </div>
      </footer>
    </div>
  )
}
