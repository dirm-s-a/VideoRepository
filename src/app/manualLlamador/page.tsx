"use client";

import {
  Monitor,
  Settings,
  Play,
  Volume2,
  Film,
  Cloud,
  Type,
  Shield,
  Globe,
  Tv,
  LayoutDashboard,
  Palette,
  TestTube,
  Server,
  RefreshCw,
  ChevronRight,
  ArrowUp,
  Download,
  BookOpen,
  Maximize,
  Mic,
  Clock,
  Eye,
  Layers,
  HardDrive,
  Wifi,
  WifiOff,
  ListMusic,
  MapPin,
} from "lucide-react";

// ── Table of Contents data ──

const sections = [
  { id: "introduccion", label: "Introduccion", icon: Globe },
  { id: "pantalla-principal", label: "Pantalla Principal", icon: Monitor },
  { id: "activacion", label: "Activacion y Modo Kiosko", icon: Maximize },
  { id: "llamado-pacientes", label: "Llamado de Pacientes", icon: Volume2 },
  { id: "tarjetas-turno", label: "Tarjetas de Turno", icon: LayoutDashboard },
  { id: "voz-tts", label: "Voz y Audio (TTS)", icon: Mic },
  { id: "video", label: "Reproductor de Video", icon: Film },
  { id: "repositorio", label: "Repositorio Central de Videos", icon: Server },
  { id: "clima", label: "Widget de Clima", icon: Cloud },
  { id: "marquesina", label: "Marquesina", icon: Type },
  { id: "config-panel", label: "Panel de Configuracion", icon: Settings },
  { id: "mock", label: "Modo Simulacion (Mock)", icon: TestTube },
  { id: "heartbeat", label: "Monitor de Servicio", icon: Shield },
  { id: "deploy", label: "Despliegue y Docker", icon: HardDrive },
];

export default function ManualLlamadorPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-slate-900 text-white shadow-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <Monitor className="h-7 w-7 text-emerald-400" />
            <div>
              <h1 className="text-xl font-bold">Llamador de Turnos</h1>
              <p className="text-xs text-gray-400">Manual de Usuario v1.0</p>
            </div>
          </div>
          <a
            href="#indice"
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
          >
            Indice
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-8 py-10">
        {/* Cover */}
        <div className="mb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <Monitor className="h-10 w-10" />
          </div>
          <h1 className="mb-3 text-4xl font-bold text-gray-900">
            Llamador de Turnos
          </h1>
          <p className="mb-2 text-xl text-gray-500">
            Sistema de Llamado de Pacientes para Salas de Espera
          </p>
          <p className="text-sm text-gray-400">Manual de Usuario — v1.0</p>
        </div>

        {/* Table of Contents */}
        <nav
          id="indice"
          className="mb-16 rounded-xl border bg-gray-50 p-8"
        >
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Indice de Contenidos
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {sections.map((s, i) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="mr-2 text-sm font-medium text-gray-400">
                      {i + 1}.
                    </span>
                    <span className="font-medium">{s.label}</span>
                  </span>
                </a>
              );
            })}
          </div>
        </nav>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTIONS                                                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}

        {/* ── 1. Introduccion ── */}
        <Section id="introduccion" icon={Globe} title="Introduccion" number={1}>
          <p>
            El <strong>Llamador de Turnos</strong> es una aplicacion web diseñada
            para reemplazar al sistema tradicional de llamado de pacientes de
            escritorio (WinForms). Se ejecuta en un navegador conectado a una
            pantalla/TV en la sala de espera y cumple tres funciones principales:
          </p>

          <ul className="my-4 space-y-2">
            <Feature>
              <strong>Llamar pacientes</strong> — muestra el turno y la
              ubicacion en pantalla con anuncio de voz (TTS)
            </Feature>
            <Feature>
              <strong>Reproducir videos</strong> — contenido institucional,
              publicidad o marketing entre llamados
            </Feature>
            <Feature>
              <strong>Informar</strong> — muestra el clima actual y mensajes
              en una marquesina inferior
            </Feature>
          </ul>

          <p>
            El sistema se conecta a una API REST existente para obtener los
            turnos pendientes y puede sincronizar los videos desde un{" "}
            <strong>Repositorio Central</strong> de forma automatica.
          </p>

          <InfoBox type="info">
            El llamador funciona como un kiosko: una vez configurado, opera de
            forma autonoma sin intervencion del usuario. Solo requiere una
            activacion inicial si el navegador bloquea el autoplay de audio.
          </InfoBox>

          <ImagePlaceholder name="llamador-general" caption="Vista general del llamador en funcionamiento" />
        </Section>

        {/* ── 2. Pantalla Principal ── */}
        <Section id="pantalla-principal" icon={Monitor} title="Pantalla Principal" number={2}>
          <p>
            La pantalla principal del llamador se divide en varias zonas segun
            el layout configurado. Existen dos modos de disposicion:
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Layout Horizontal (por defecto)
          </h3>
          <div className="my-4 rounded-lg border bg-gray-50 p-4 font-mono text-sm">
            <pre className="text-gray-600">{`┌──────────────────────────┬─────────────┐
│       Clima (barra)      │             │
├──────────────────────────┤  Tarjetas   │
│                          │  de Turno   │
│       Video (centro)     │  (lateral)  │
│                          │             │
├──────────────────────────┤             │
│    Marquesina (pie)      │             │
└──────────────────────────┴─────────────┘`}</pre>
          </div>
          <p>
            El video ocupa el area principal a la izquierda. Las tarjetas de
            turno se muestran en una columna lateral a la derecha. El clima se
            muestra arriba y la marquesina al pie.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Layout Vertical
          </h3>
          <div className="my-4 rounded-lg border bg-gray-50 p-4 font-mono text-sm">
            <pre className="text-gray-600">{`┌────────────────────────────────────────┐
│           Clima (barra)                │
├────────────────────────────────────────┤
│  [Turno 1] [Turno 2] [Turno 3]        │
│  [Turno 4] [Turno 5] [Turno 6]        │
├────────────────────────────────────────┤
│                                        │
│            Video (centro)              │
│                                        │
├────────────────────────────────────────┤
│           Marquesina (pie)             │
└────────────────────────────────────────┘`}</pre>
          </div>
          <p>
            En modo vertical las tarjetas de turno se ubican en una grilla
            entre el clima y el video. La cantidad de columnas por fila es
            configurable con el campo <Code>columnasVertical</Code> (por
            defecto 3). Ideal para pantallas verticales (TV en modo portrait)
            donde se necesita 1 columna, o pantallas anchas donde 3 o mas
            columnas aprovechan mejor el espacio.
          </p>

          <ImagePlaceholder name="llamador-horizontal" caption="Layout horizontal con tarjetas a la derecha" />
          <ImagePlaceholder name="llamador-vertical" caption="Layout vertical con tarjetas en grilla" />
        </Section>

        {/* ── 3. Activacion y Modo Kiosko ── */}
        <Section id="activacion" icon={Maximize} title="Activacion y Modo Kiosko" number={3}>
          <p>
            Los navegadores modernos bloquean la reproduccion automatica de audio
            hasta que el usuario interactue con la pagina. Por este motivo, al
            cargar el llamador por primera vez se muestra una pantalla de
            activacion.
          </p>

          <StepList>
            <Step n={1}>
              El llamador carga y muestra <strong>&ldquo;Cargando configuracion...&rdquo;</strong> mientras
              obtiene la configuracion
            </Step>
            <Step n={2}>
              Si el navegador bloquea el autoplay, aparece el boton{" "}
              <InlineButton>Iniciar Llamador</InlineButton>
            </Step>
            <Step n={3}>
              Al pulsar el boton, se habilita el audio y el llamador entra en
              modo activo (pantalla completa si esta en modo kiosko)
            </Step>
          </StepList>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Modo Kiosko
          </h3>
          <p>
            Cuando <Code>modoKiosko: true</Code>, el llamador:
          </p>
          <ul className="my-3 space-y-1">
            <Feature>Omite la pantalla de activacion e inicia automaticamente</Feature>
            <Feature>Entra en pantalla completa (fullscreen)</Feature>
            <Feature>Ideal para equipos dedicados donde no hay interaccion manual</Feature>
          </ul>

          <InfoBox type="tip">
            Para que el modo kiosko funcione sin boton de activacion, el
            navegador debe permitir autoplay. En Chrome se puede configurar
            con la flag <Code>--autoplay-policy=no-user-gesture-required</Code>.
          </InfoBox>

          <ImagePlaceholder name="llamador-activacion" caption="Pantalla de activacion con boton Iniciar Llamador" />
        </Section>

        {/* ── 4. Llamado de Pacientes ── */}
        <Section id="llamado-pacientes" icon={Volume2} title="Llamado de Pacientes" number={4}>
          <p>
            El llamador consulta periodicamente la API REST para obtener turnos
            pendientes. Cuando hay un nuevo turno, se ejecuta la siguiente
            secuencia:
          </p>

          <StepList>
            <Step n={1}>
              Se reproduce el sonido <strong>ding-dong</strong> (si esta habilitado)
            </Step>
            <Step n={2}>
              Se anuncia el turno por voz: <em>&ldquo;Paciente de la Fuente Diego, dirijase a Consultorio 5&rdquo;</em>
            </Step>
            <Step n={3}>
              Se muestra un overlay grande con el numero de turno y la ubicacion
            </Step>
            <Step n={4}>
              Despues de unos segundos (configurable), el overlay se cierra y el
              turno queda visible en las tarjetas laterales
            </Step>
          </StepList>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Maquina de Estados
          </h3>
          <p>
            El sistema de llamado opera con tres estados:
          </p>
          <div className="my-4 grid grid-cols-3 gap-3">
            <StatusBadge color="blue" label="IDLE" desc="Esperando turnos" />
            <StatusBadge color="yellow" label="CALLING" desc="Anunciando turno" />
            <StatusBadge color="green" label="SHOW_CARD" desc="Mostrando tarjeta" />
          </div>
          <div className="my-4 rounded-lg border bg-gray-50 p-4 font-mono text-sm text-center">
            <span className="text-blue-600">IDLE</span>
            <span className="mx-2 text-gray-400">&rarr;</span>
            <span className="text-amber-600">CALLING</span>
            <span className="mx-2 text-gray-400">&rarr;</span>
            <span className="text-green-600">SHOW_CARD</span>
            <span className="mx-2 text-gray-400">&rarr;</span>
            <span className="text-blue-600">IDLE</span>
          </div>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Cola de turnos
          </h3>
          <p>
            Si llegan multiples turnos mientras se esta anunciando uno, se
            encolan y se procesan en orden. El video se pausa automaticamente
            durante el llamado y se reanuda al volver al estado IDLE.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Configuracion del polling
          </h3>
          <div className="my-4 space-y-2">
            <ConfigItem label="intervaloBuscarProximo" desc="Intervalo en segundos entre cada consulta a la API (por defecto 5)" />
            <ConfigItem label="llamarComo" desc="Identificador del llamador en la API (ej: LLAMADOR_1)" />
            <ConfigItem label="urlServicios" desc="URL base de la API REST del backend" />
          </div>
        </Section>

        {/* ── 5. Tarjetas de Turno ── */}
        <Section id="tarjetas-turno" icon={LayoutDashboard} title="Tarjetas de Turno" number={5}>
          <p>
            Las tarjetas de turno muestran los ultimos pacientes llamados. Se
            actualizan en tiempo real a medida que llegan nuevos turnos.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Anatomia de una tarjeta
          </h3>
          <div className="my-4 rounded-lg border bg-gray-50 p-4 font-mono text-sm">
            <pre className="text-gray-600">{`┌──────────────────────┐
│                      │
│     123  (turno)     │
│   ───────────────    │  ← separador
│  Consultorio 5       │  ← ubicacion
│                      │
└──────────────────────┘`}</pre>
          </div>

          <p>
            Cada elemento de la tarjeta es personalizable: fuente, tamaño,
            color del texto, color del separador y colores de fondo (gradiente).
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Comportamiento
          </h3>
          <ul className="my-3 space-y-1">
            <Feature>
              Las tarjetas vacias (sin turno asignado) se muestran con 40% de opacidad
            </Feature>
            <Feature>
              El turno actual (en estado CALLING) se resalta con un efecto de borde animado
            </Feature>
            <Feature>
              Los turnos recientes permanecen visibles hasta que se llenan todas las posiciones
            </Feature>
          </ul>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Opciones de personalizacion
          </h3>
          <div className="my-4 space-y-2">
            <ConfigItem label="tarjetas" desc="Cantidad de tarjetas visibles simultaneamente (por defecto 5)" />
            <ConfigItem label="columnasVertical" desc="Columnas por fila en layout vertical (ej: 3 col x 2 filas = 6 tarjetas). Usar 1 para TV en modo portrait" />
            <ConfigItem label="porcentajeAncho" desc="Ancho de la columna de tarjetas en layout horizontal (% de la pantalla)" />
            <ConfigItem label="porcentajeAlto" desc="Alto de la zona de tarjetas en layout vertical (% de la pantalla)" />
            <ConfigItem label="fuenteTurno / tamanoFuenteTurno" desc="Fuente y tamaño del numero de turno" />
            <ConfigItem label="colorFuenteTurno" desc="Color del texto del turno (formato HEX)" />
            <ConfigItem label="fuenteUbicacion / tamanoFuenteUbicacion" desc="Fuente y tamaño de la ubicacion" />
            <ConfigItem label="colorSeparador" desc="Color de la linea divisoria entre turno y ubicacion" />
            <ConfigItem label="colorFondoIzquierda / colorFondoDerecha" desc="Gradiente de fondo de la tarjeta" />
          </div>

          <ImagePlaceholder name="llamador-tarjetas" caption="Tarjetas de turno en layout horizontal" />
        </Section>

        {/* ── 6. Voz y Audio (TTS) ── */}
        <Section id="voz-tts" icon={Mic} title="Voz y Audio (TTS)" number={6}>
          <p>
            El llamador anuncia cada turno por voz utilizando un sistema de
            Text-to-Speech (TTS) con multiples opciones.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Prioridad de voces
          </h3>
          <p>
            El sistema intenta usar la mejor voz disponible, en este orden:
          </p>
          <StepList>
            <Step n={1}>
              <strong>Piper TTS</strong> (servicio Docker) — voz sintetica de
              alta calidad, funciona sin internet
            </Step>
            <Step n={2}>
              <strong>Google Cloud TTS</strong> — requiere API key y conexion
              a internet
            </Step>
            <Step n={3}>
              <strong>Web Speech API</strong> — voz nativa del navegador como
              fallback automatico
            </Step>
          </StepList>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Voces disponibles en Piper
          </h3>
          <div className="my-4 overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Voz</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Idioma</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Calidad</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="px-4 py-2"><Code>es_AR-daniela-high</Code></td><td className="px-4 py-2">Español (Argentina)</td><td className="px-4 py-2">Alta</td></tr>
                <tr><td className="px-4 py-2"><Code>es_MX-claude-high</Code></td><td className="px-4 py-2">Español (Mexico)</td><td className="px-4 py-2">Alta</td></tr>
                <tr><td className="px-4 py-2"><Code>es_MX-ald-medium</Code></td><td className="px-4 py-2">Español (Mexico)</td><td className="px-4 py-2">Media</td></tr>
                <tr><td className="px-4 py-2"><Code>es_ES-davefx-medium</Code></td><td className="px-4 py-2">Español (España)</td><td className="px-4 py-2">Media</td></tr>
                <tr><td className="px-4 py-2"><Code>es_ES-sharvard-medium</Code></td><td className="px-4 py-2">Español (España)</td><td className="px-4 py-2">Media</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Secuencia de anuncio
          </h3>
          <StepList>
            <Step n={1}>Se reproduce el sonido <strong>ding-dong</strong> (configurable)</Step>
            <Step n={2}>Pausa de 500ms</Step>
            <Step n={3}>Se lee el mensaje de voz, por ejemplo: <em>&ldquo;Paciente de la Fuente Diego, dirijase a Consultorio 5&rdquo;</em></Step>
            <Step n={4}>Pausa configurable (<Code>segundosPausaVoz</Code>) antes de cerrar el overlay</Step>
          </StepList>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Mensaje de voz
          </h3>
          <p>
            El texto que se lee por voz se configura con un template que acepta
            variables:
          </p>
          <div className="my-4 space-y-2">
            <ConfigItem label="mensajeVoz" desc='Template del mensaje. Ejemplo: "Paciente {turno}, dirijase a {ubicacion}"' />
            <ConfigItem label="{turno}" desc="Se reemplaza por el numero de turno del paciente" />
            <ConfigItem label="{ubicacion}" desc="Se reemplaza por la ubicacion/consultorio" />
          </div>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Configuracion de audio
          </h3>
          <div className="my-4 space-y-2">
            <ConfigItem label="voz" desc="Nombre de la voz TTS a utilizar (ej: es_AR-daniela-high)" />
            <ConfigItem label="lenguaje" desc="Codigo de idioma (ej: es-AR, es-ES, es-MX)" />
            <ConfigItem label="dingDong" desc="Activar/desactivar el sonido previo al anuncio" />
            <ConfigItem label="segundosPausaVoz" desc="Segundos de pausa despues del anuncio antes de cerrar el overlay" />
            <ConfigItem label="pathDingDong" desc="Ruta al archivo de sonido ding-dong" />
          </div>
        </Section>

        {/* ── 7. Reproductor de Video ── */}
        <Section id="video" icon={Film} title="Reproductor de Video" number={7}>
          <p>
            Entre llamados, el llamador reproduce una lista de videos en forma
            continua. Soporta tres tipos de contenido:
          </p>

          <div className="my-6 grid grid-cols-3 gap-4">
            <MiniCard icon={Film} label="MP4 Local" desc="Archivos en el servidor" color="blue" />
            <MiniCard icon={Play} label="YouTube" desc="Videos embebidos" color="red" />
            <MiniCard icon={Play} label="Vimeo" desc="Videos embebidos" color="purple" />
          </div>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Funcionamiento
          </h3>
          <ul className="my-3 space-y-1">
            <Feature>Los videos se reproducen en secuencia automatica (playlist)</Feature>
            <Feature>Al terminar un video se pasa al siguiente</Feature>
            <Feature>La posicion actual se guarda en el navegador y sobrevive reinicios</Feature>
            <Feature>Durante un llamado el video se pausa y se reanuda al finalizar</Feature>
          </ul>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Audio del video
          </h3>
          <p>
            Por restriccion de los navegadores, los videos inician silenciados
            para permitir el autoplay. Si <Code>videoMute: false</Code>, el
            audio se habilita automaticamente al primer click/interaccion del
            usuario. Si <Code>videoMute: true</Code>, los videos permanecen
            siempre silenciados.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Configuracion de video
          </h3>
          <div className="my-4 space-y-2">
            <ConfigItem label="videoMute" desc="Silenciar todos los videos (true/false)" />
            <ConfigItem label="pathVideos" desc='Carpeta base de videos locales (por defecto "/videos/")' />
            <ConfigItem label="tandaVideo" desc="Lista de videos: archivos MP4, URLs de YouTube o Vimeo" />
          </div>

          <InfoBox type="info">
            Los formatos locales soportados son: MP4, WebM, OGG, AVI, MKV, MOV.
            Para YouTube y Vimeo se utiliza la URL completa del video.
          </InfoBox>
        </Section>

        {/* ── 8. Repositorio Central de Videos ── */}
        <Section id="repositorio" icon={Server} title="Repositorio Central de Videos" number={8}>
          <p>
            Cuando se habilita el <strong>Repositorio Central</strong>, el
            llamador sincroniza automaticamente sus videos desde un servidor
            centralizado, en lugar de usar una lista manual.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Como funciona la sincronizacion
          </h3>
          <StepList>
            <Step n={1}>
              El llamador consulta al repositorio la playlist asignada a su nombre
            </Step>
            <Step n={2}>
              Compara los videos locales (cache) contra los del repositorio usando hash SHA256
            </Step>
            <Step n={3}>
              Descarga los videos nuevos o modificados (con reintentos automaticos)
            </Step>
            <Step n={4}>
              Elimina los videos que ya no estan en la playlist
            </Step>
            <Step n={5}>
              Reporta su estado al repositorio (videos en cache, video actual, etc.)
            </Step>
          </StepList>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Reportes automaticos
          </h3>
          <p>
            Con el repositorio activo, el llamador envia automaticamente:
          </p>
          <ul className="my-3 space-y-1">
            <Feature>
              <strong>Estado de cache</strong> cada 60 segundos: que video se
              esta reproduciendo, cuantos hay en cache, estado de sincronizacion
            </Feature>
            <Feature>
              <strong>Reproduccion de videos</strong>: al terminar cada video
              reporta el nombre del archivo y la duracion, permitiendo al
              repositorio generar estadisticas
            </Feature>
          </ul>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Configuracion
          </h3>
          <div className="my-4 space-y-2">
            <ConfigItem label="usarRepositorioCentral" desc="Activar sincronizacion con el repositorio central (true/false)" />
            <ConfigItem label="urlRepositorio" desc="URL del servicio de repositorio (ej: https://videorepository.dim.com.ar)" />
            <ConfigItem label="intervaloSyncMinutos" desc="Cada cuantos minutos verificar nuevos videos (por defecto 5)" />
          </div>

          <InfoBox type="tip">
            El repositorio central es la forma recomendada de gestionar los
            videos. Permite cambiar la playlist de cualquier llamador desde el
            panel web sin necesidad de acceder fisicamente al equipo.
          </InfoBox>
        </Section>

        {/* ── 9. Widget de Clima ── */}
        <Section id="clima" icon={Cloud} title="Widget de Clima" number={9}>
          <p>
            La barra superior muestra informacion meteorologica en tiempo real
            para la ciudad configurada. Se actualiza cada 30 minutos.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Informacion mostrada
          </h3>
          <div className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <MiniCard icon={MapPin} label="Ciudad" desc="Nombre de la ciudad" color="blue" />
            <MiniCard icon={Clock} label="Fecha y Hora" desc="Opcional, en vivo" color="purple" />
            <MiniCard icon={Cloud} label="Temperatura" desc="Grados Celsius" color="emerald" />
            <MiniCard icon={ArrowUp} label="Viento" desc="Velocidad y direccion" color="green" />
            <MiniCard icon={Eye} label="Humedad" desc="Porcentaje" color="blue" />
          </div>

          <p>
            Tambien muestra un icono grafico del estado del tiempo (soleado,
            nublado, lluvia, nieve, etc.) y una descripcion en español.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Fecha y hora en vivo
          </h3>
          <p>
            De forma opcional, la barra de clima puede mostrar la <strong>fecha
            y hora actual</strong> junto al nombre de la ciudad. Se actualiza
            en tiempo real (cada segundo). El formato de hora puede ser de
            24 horas (14:30) o 12 horas (2:30 p.m.).
          </p>

          <ImagePlaceholder name="llamador-clima-fechahora" caption="Barra de clima con fecha y hora activadas" />

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Configuracion
          </h3>
          <div className="my-4 space-y-2">
            <ConfigItem label="ciudad" desc='Ciudad y codigo de pais. Formato: "Ciudad,Pais" (ej: "Buenos Aires,AR")' />
            <ConfigItem label="porcentajeAlto" desc="Altura de la barra de clima como % de la pantalla" />
            <ConfigItem label="mostrarFechaHora" desc="Activar/desactivar la visualizacion de fecha y hora actual (true/false)" />
            <ConfigItem label="tamanoFuenteFechaHora" desc="Tamaño de la fuente de fecha y hora en pixeles (por defecto 14)" />
            <ConfigItem label="formatoHora" desc='Formato de hora: "24h" (14:30) o "12h" (2:30 p.m.)' />
            <ConfigItem label="Fuentes y colores" desc="Personalizables para el nombre de la ciudad y los datos del clima" />
          </div>

          <InfoBox type="info">
            El clima se obtiene de Open-Meteo (API gratuita, sin clave). No
            requiere configuracion adicional mas alla de la ciudad.
          </InfoBox>
        </Section>

        {/* ── 10. Marquesina ── */}
        <Section id="marquesina" icon={Type} title="Marquesina" number={10}>
          <p>
            La marquesina es un banner en la parte inferior de la pantalla con
            texto que se desplaza continuamente de derecha a izquierda.
          </p>

          <ul className="my-3 space-y-1">
            <Feature>El texto hace un ciclo completo en 30 segundos</Feature>
            <Feature>Se pausa automaticamente durante los llamados de pacientes</Feature>
            <Feature>Fuente, tamaño, color del texto y fondo son configurables</Feature>
          </ul>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Configuracion
          </h3>
          <div className="my-4 space-y-2">
            <ConfigItem label="texto" desc="El mensaje que se desplaza en la marquesina" />
            <ConfigItem label="porcentajeAlto" desc="Altura de la marquesina como % de la pantalla" />
            <ConfigItem label="fuente / tamanoFuente" desc="Tipo de fuente y tamaño del texto" />
            <ConfigItem label="colorFuente" desc="Color del texto (formato HEX)" />
            <ConfigItem label="colorFondo" desc="Color de fondo de la barra (formato HEX)" />
          </div>
        </Section>

        {/* ── 11. Panel de Configuracion ── */}
        <Section id="config-panel" icon={Settings} title="Panel de Configuracion" number={11}>
          <p>
            El panel de configuracion permite ajustar todos los parametros del
            llamador en tiempo real, sin necesidad de editar archivos
            manualmente.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Acceso
          </h3>
          <p>
            Para abrir el panel, presionar el boton{" "}
            <InlineButton><InlineIcon icon={Settings} /> (engranaje)</InlineButton>{" "}
            ubicado en la esquina superior izquierda de la pantalla del llamador.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Secciones del panel
          </h3>
          <div className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniCard icon={Settings} label="General" desc="Debug, kiosko, API, layout" color="blue" />
            <MiniCard icon={Layers} label="Tarjetas" desc="Estilo de tarjetas" color="emerald" />
            <MiniCard icon={Type} label="Marquesina" desc="Texto y estilo" color="purple" />
            <MiniCard icon={Cloud} label="Clima" desc="Ciudad y estilo" color="green" />
            <MiniCard icon={Mic} label="Voz / TTS" desc="Voces y audio" color="blue" />
            <MiniCard icon={Film} label="Video" desc="Playlist y repositorio" color="emerald" />
            <MiniCard icon={Palette} label="Overlay" desc="Estilo del llamado" color="purple" />
            <MiniCard icon={TestTube} label="Simulacion" desc="Modo mock" color="green" />
          </div>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Acciones disponibles
          </h3>
          <ul className="my-3 space-y-1">
            <Feature>
              <InlineButton>Guardar</InlineButton> — persiste los cambios en el
              servidor. El llamador se reconfigura automaticamente
            </Feature>
            <Feature>
              <InlineButton>Deshacer</InlineButton> — revierte los cambios no
              guardados
            </Feature>
            <Feature>
              <InlineButton><InlineIcon icon={Download} /> Exportar</InlineButton> — descarga
              la configuracion visual (layout) como archivo YAML
            </Feature>
            <Feature>
              <InlineButton><InlineIcon icon={RefreshCw} /> Importar</InlineButton> — carga una configuracion
              desde un archivo YAML
            </Feature>
          </ul>

          <InfoBox type="tip">
            Los cambios en la configuracion se aplican inmediatamente al guardar.
            No es necesario reiniciar el llamador.
          </InfoBox>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Exportar e importar layout
          </h3>
          <p>
            Cuando hay multiples llamadores con la misma configuracion visual
            (colores, fuentes, tarjetas, marquesina, etc.), se puede exportar
            el layout desde uno e importarlo en los demas.
          </p>

          <h4 className="mb-2 mt-4 font-semibold text-gray-700">
            Exportar
          </h4>
          <p>
            El boton <InlineButton><InlineIcon icon={Download} /> Exportar</InlineButton>{" "}
            descarga un archivo <Code>llamador-layout.yml</Code> con toda la
            configuracion <strong>excepto</strong> los datos especificos de
            instalacion:
          </p>
          <ul className="my-3 space-y-1">
            <Feature><Code>nombreLlamador</Code> — nombre unico de cada llamador</Feature>
            <Feature><Code>llamarComo</Code> — identificador para la API REST</Feature>
            <Feature><Code>idServicio</Code> — ID de servicio para el backend</Feature>
          </ul>

          <h4 className="mb-2 mt-4 font-semibold text-gray-700">
            Importar
          </h4>
          <p>
            Al importar un archivo YAML, el sistema detecta si faltan los datos
            de instalacion. Si el archivo es un &ldquo;layout exportado&rdquo;
            (sin los 3 campos anteriores), se muestra un formulario para
            completarlos antes de aplicar la configuracion.
          </p>

          <StepList>
            <Step n={1}>
              Presionar <InlineButton>Importar</InlineButton> y seleccionar
              el archivo <Code>.yml</Code>
            </Step>
            <Step n={2}>
              Si faltan datos de instalacion, aparece un formulario
              pre-llenado con los valores actuales del llamador
            </Step>
            <Step n={3}>
              Completar o confirmar los campos y presionar{" "}
              <InlineButton>Importar</InlineButton>
            </Step>
            <Step n={4}>
              Se muestra el mensaje <em>&ldquo;Importacion exitosa&rdquo;</em>{" "}
              y la configuracion se aplica automaticamente
            </Step>
          </StepList>

          <InfoBox type="info">
            Si se importa un YAML completo (con los 3 campos de instalacion),
            se aplica directamente sin mostrar el formulario.
          </InfoBox>

          <ImagePlaceholder name="llamador-config" caption="Panel de configuracion del llamador" />
          <ImagePlaceholder name="llamador-export-import" caption="Botones de exportar e importar en la barra de acciones" />
          <ImagePlaceholder name="importar-datos" caption="Formulario de datos de instalacion al importar un layout" />
        </Section>

        {/* ── 12. Modo Simulacion (Mock) ── */}
        <Section id="mock" icon={TestTube} title="Modo Simulacion (Mock)" number={12}>
          <p>
            El modo simulacion permite probar el llamador sin conexion al
            backend real. Genera llamados ficticios automaticamente.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Cuando usarlo
          </h3>
          <ul className="my-3 space-y-1">
            <Feature>Para pruebas y demostraciones sin backend</Feature>
            <Feature>Para verificar la configuracion visual (tarjetas, overlay, voz)</Feature>
            <Feature>Durante el desarrollo y configuracion inicial</Feature>
          </ul>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Funcionamiento
          </h3>
          <p>
            Al activar <Code>mock.modoMock: true</Code>, se desactiva el
            polling real y se generan llamados automaticos a partir de una lista
            predefinida de pacientes ficticios. Puede funcionar en modo
            secuencial (en orden) o aleatorio.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Panel de control
          </h3>
          <p>
            Cuando el modo mock esta activo aparece un panel flotante en la
            esquina inferior derecha que muestra:
          </p>
          <ul className="my-3 space-y-1">
            <Feature>Estado actual de la maquina (IDLE, CALLING, SHOW_CARD)</Feature>
            <Feature>Cantidad de turnos en cola y turnos recientes</Feature>
            <Feature>Boton <InlineButton>Forzar Llamada</InlineButton> para
              disparar un llamado manual al instante</Feature>
          </ul>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Configuracion
          </h3>
          <div className="my-4 space-y-2">
            <ConfigItem label="modoMock" desc="Activar/desactivar el modo simulacion (true/false)" />
            <ConfigItem label="intervaloSegundos" desc="Tiempo entre llamados automaticos (segundos)" />
            <ConfigItem label="secuencial" desc="true = cicla en orden, false = seleccion aleatoria" />
            <ConfigItem label="llamadas" desc="Lista de pacientes ficticios con nombre e idbox (ubicacion)" />
          </div>
        </Section>

        {/* ── 13. Monitor de Servicio ── */}
        <Section id="heartbeat" icon={Shield} title="Monitor de Servicio (Heartbeat)" number={13}>
          <p>
            El llamador se registra automaticamente en el backend como un
            servicio activo y envia señales periodicas de &ldquo;estoy vivo&rdquo;
            (heartbeat).
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Funcionamiento
          </h3>
          <StepList>
            <Step n={1}>
              Al iniciar, el llamador se registra en la API con su nombre,
              version, IP y tipo de servicio
            </Step>
            <Step n={2}>
              Cada <strong>60 segundos</strong> envia un heartbeat para
              confirmar que sigue activo
            </Step>
            <Step n={3}>
              Al cerrar la pagina, intenta des-registrarse del backend
            </Step>
          </StepList>

          <p className="mt-4">
            El backend puede usar estos heartbeats para detectar llamadores
            caidos o con problemas de conectividad.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Configuracion relacionada
          </h3>
          <div className="my-4 space-y-2">
            <ConfigItem label="idServicio" desc="ID del servicio para registro en el backend" />
            <ConfigItem label="nombreLlamador" desc="Nombre con el que se identifica en el backend" />
            <ConfigItem label="appVer" desc="Version de la aplicacion reportada al backend" />
          </div>
        </Section>

        {/* ── 14. Despliegue y Docker ── */}
        <Section id="deploy" icon={HardDrive} title="Despliegue y Docker" number={14}>
          <p>
            El llamador se distribuye como una imagen Docker que incluye la
            aplicacion web y opcionalmente el servicio de voz Piper TTS.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Componentes del despliegue
          </h3>
          <div className="my-4 grid grid-cols-2 gap-4">
            <MiniCard icon={Monitor} label="Llamador" desc="App Next.js (puerto 3000)" color="blue" />
            <MiniCard icon={Mic} label="Piper TTS" desc="Servicio de voz (puerto 8000)" color="emerald" />
          </div>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Variables de entorno
          </h3>
          <div className="my-4 overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Variable</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Descripcion</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="px-4 py-2"><Code>PIPER_TTS_URL</Code></td><td className="px-4 py-2">URL del servicio Piper TTS (ej: http://piper:8000)</td></tr>
                <tr><td className="px-4 py-2"><Code>PIPER_DEFAULT_VOICE</Code></td><td className="px-4 py-2">Voz por defecto de Piper (ej: es_AR-daniela-high)</td></tr>
                <tr><td className="px-4 py-2"><Code>PIPER_LENGTH_SCALE</Code></td><td className="px-4 py-2">Velocidad de la voz (1.0=normal, 1.3=mas lento)</td></tr>
                <tr><td className="px-4 py-2"><Code>TTS_API_KEY</Code></td><td className="px-4 py-2">Clave de Google Cloud TTS (opcional)</td></tr>
                <tr><td className="px-4 py-2"><Code>PORT</Code></td><td className="px-4 py-2">Puerto del servidor (por defecto 3000)</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Archivo de configuracion
          </h3>
          <p>
            La configuracion del llamador se almacena en{" "}
            <Code>/public/configuracion.yml</Code> (formato YAML) o{" "}
            <Code>/public/configuracion.json</Code> (formato JSON). Tambien
            puede gestionarse dinamicamente a traves del panel de configuracion,
            que la guarda via la API <Code>/api/config</Code>.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Volumenes Docker
          </h3>
          <p>
            El directorio <Code>/app/public</Code> debe montarse como volumen
            para que la configuracion y los videos persistan entre reinicios del
            contenedor.
          </p>

          <InfoBox type="warning">
            Si se usa el Repositorio Central, los videos se descargan
            automaticamente a la carpeta de videos. Asegurese de que el volumen
            tenga suficiente espacio en disco.
          </InfoBox>
        </Section>

        {/* ── Back to top ── */}
        <div className="mt-16 text-center">
          <a
            href="#indice"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            <ArrowUp className="h-4 w-4" />
            Volver al indice
          </a>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t pt-6 text-center text-sm text-gray-400">
          <p>Llamador de Turnos — Manual de Usuario v1.0</p>
          <p className="mt-1">
            Documentacion generada para la version web del sistema de llamado de turnos.
          </p>
        </footer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* REUSABLE COMPONENTS                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

function Section({
  id,
  icon: Icon,
  title,
  number,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  number: number;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <div className="mb-6 flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <p className="text-sm font-medium text-emerald-600">
            Seccion {number}
          </p>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
      </div>
      <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
      <span>{children}</span>
    </li>
  );
}

function StepList({ children }: { children: React.ReactNode }) {
  return <ol className="my-4 space-y-3">{children}</ol>;
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
        {n}
      </span>
      <span className="pt-0.5">{children}</span>
    </li>
  );
}

function InfoBox({
  type,
  children,
}: {
  type: "info" | "tip" | "warning";
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    tip: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
  };
  const labels = { info: "Nota", tip: "Consejo", warning: "Importante" };
  return (
    <div className={`my-6 rounded-lg border p-4 ${styles[type]}`}>
      <p className="mb-1 text-sm font-bold">{labels[type]}</p>
      <p className="text-sm">{children}</p>
    </div>
  );
}

function InlineButton({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-sm font-medium text-gray-700">
      {children}
    </span>
  );
}

function InlineIcon({
  icon: Icon,
}: {
  icon: React.ComponentType<{ className?: string }>;
}) {
  return <Icon className="inline h-3.5 w-3.5" />;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono text-gray-800">
      {children}
    </code>
  );
}

function ConfigItem({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-gray-50 px-4 py-2.5">
      <code className="shrink-0 rounded bg-white px-2 py-0.5 text-sm font-mono text-emerald-700 border">
        {label}
      </code>
      <span className="text-sm text-gray-600">{desc}</span>
    </div>
  );
}

function StatusBadge({
  color,
  label,
  desc,
}: {
  color: string;
  label: string;
  desc: string;
}) {
  const colorMap: Record<string, string> = {
    green: "bg-green-100 text-green-700 border-green-200",
    red: "bg-red-100 text-red-700 border-red-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    yellow: "bg-amber-100 text-amber-700 border-amber-200",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
  };
  const dotColor: Record<string, string> = {
    green: "bg-green-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    yellow: "bg-amber-500",
    gray: "bg-gray-400",
  };
  return (
    <div className={`flex items-center gap-3 rounded-lg border px-4 py-2 ${colorMap[color]}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${dotColor[color]}`} />
      <div>
        <span className="text-sm font-semibold">{label}</span>
        <span className="ml-2 text-xs opacity-80">— {desc}</span>
      </div>
    </div>
  );
}

function MiniCard({
  icon: Icon,
  label,
  desc,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="rounded-lg border p-3 text-center">
      <div
        className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${colorMap[color]}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <p className="text-xs text-gray-400">{desc}</p>
    </div>
  );
}

function ImagePlaceholder({ name, caption, size = "full" }: { name: string; caption: string; size?: "sm" | "md" | "full" }) {
  const widthClass = size === "sm" ? "w-2/5" : size === "md" ? "w-3/5" : "w-full";
  return (
    <figure className="my-6 flex flex-col items-center">
      <div className={`${widthClass} overflow-hidden rounded-lg border bg-gray-100`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/manualLlamador/${name}.png`}
          alt={caption}
          className="w-full"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = "none";
            const placeholder = target.nextElementSibling as HTMLElement;
            if (placeholder) placeholder.style.display = "flex";
          }}
        />
        <div
          className="hidden items-center justify-center py-16 text-gray-400"
          style={{ display: "none" }}
        >
          <div className="text-center">
            <Play className="mx-auto mb-2 h-8 w-8" />
            <p className="text-sm">Captura pendiente: {name}.png</p>
          </div>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm text-gray-500">
        {caption}
      </figcaption>
    </figure>
  );
}
