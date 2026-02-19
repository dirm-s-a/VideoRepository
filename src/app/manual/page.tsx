"use client";

import {
  Server,
  LayoutDashboard,
  Film,
  ListMusic,
  Monitor,
  MapPin,
  BarChart3,
  Users,
  Database,
  Upload,
  Download,
  Settings,
  Search,
  Plus,
  Trash2,
  KeyRound,
  RefreshCw,
  ArrowUp,
  Play,
  Shield,
  Globe,
  Pencil,
  Eye,
  Camera,
  ArrowUpDown,
  Calendar,
  HardDrive,
  RotateCcw,
  AlertTriangle,
  Check,
  Wifi,
  WifiOff,
  Clock,
  Tv,
  GripVertical,
  Image,
  FileText,
  ChevronRight,
} from "lucide-react";

// ── Table of Contents data ──

const sections = [
  { id: "introduccion", label: "Introduccion", icon: Globe },
  { id: "acceso", label: "Acceso al Sistema", icon: Shield },
  { id: "navegacion", label: "Navegacion", icon: ChevronRight },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "videos", label: "Videos", icon: Film },
  { id: "playlists", label: "Playlists", icon: ListMusic },
  { id: "llamadores", label: "Llamadores", icon: Monitor },
  { id: "ubicaciones", label: "Ubicaciones", icon: MapPin },
  { id: "estadisticas", label: "Estadisticas", icon: BarChart3 },
  { id: "usuarios", label: "Usuarios", icon: Users },
  { id: "database", label: "Base de Datos", icon: Database },
  { id: "exportacion", label: "Exportacion de Datos", icon: Download },
  { id: "grillas", label: "Funciones de Grilla", icon: FileText },
];

export default function ManualPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-gray-900 text-white shadow-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <Server className="h-7 w-7 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">Video Repository</h1>
              <p className="text-xs text-gray-400">Manual de Usuario v1.0</p>
            </div>
          </div>
          <a
            href="#indice"
            className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Indice
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-8 py-10">
        {/* Cover */}
        <div className="mb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Server className="h-10 w-10" />
          </div>
          <h1 className="mb-3 text-4xl font-bold text-gray-900">
            Video Repository
          </h1>
          <p className="mb-2 text-xl text-gray-500">
            Administrador Centralizado de Videos para Llamadores de Turnos
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
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
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
            <strong>Video Repository</strong> es un sistema web de administracion
            centralizada de videos para los llamadores de turnos. Desde un
            unico panel se puede gestionar todo el ciclo de vida de los
            contenidos que se reproducen en los llamadores de las salas de
            espera.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Que permite hacer
          </h3>
          <ul className="my-4 space-y-2">
            <Feature>
              <strong>Subir y organizar videos</strong> que se reproducen en los llamadores de las salas de espera
              (institucionales, publicidad, marketing, etc.)
            </Feature>
            <Feature>
              <strong>Crear playlists</strong> personalizadas para cada
              llamador o grupo de llamadores
            </Feature>
            <Feature>
              <strong>Monitorear en tiempo real</strong> el estado de cada
              llamador: online, offline, sincronizando, error
            </Feature>
            <Feature>
              <strong>Configurar llamadores</strong> individualmente: asignar
              playlist, ubicacion, layout, foto del equipo
            </Feature>
            <Feature>
              <strong>Administrar ubicaciones</strong> fisicas (centros,
              sucursales, pisos) con un ABM dedicado
            </Feature>
            <Feature>
              <strong>Consultar estadisticas</strong> detalladas de reproduccion
              de videos por llamador, fecha, ubicacion y tipo
            </Feature>
            <Feature>
              <strong>Exportar datos</strong> a Excel, PDF y CSV desde cualquier
              grilla
            </Feature>
            <Feature>
              <strong>Respaldar y restaurar</strong> la base de datos completa
            </Feature>
          </ul>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Como funciona
          </h3>
          <p>
            Los llamadores (dispositivos ubicados junto a las pantallas) se
            conectan periodicamente al repositorio central. Descargan los videos
            de la playlist asignada, los almacenan en cache local y reportan su
            estado (que video estan reproduciendo, cuantos tienen en cache, etc.).
            Todo esto se visualiza en el Dashboard y en la pantalla de Llamadores.
          </p>

          <InfoBox type="info">
            Los llamadores se sincronizan automaticamente. No es necesario
            realizar ninguna accion manual para que un llamador descargue sus
            videos.
          </InfoBox>


        </Section>

        {/* ── 2. Acceso al Sistema ── */}
        <Section id="acceso" icon={Shield} title="Acceso al Sistema" number={2}>
          <p>
            El sistema requiere autenticacion para acceder al panel de
            administracion. Al navegar a la URL del servidor, se presenta
            automaticamente la pantalla de login si el usuario no esta
            autenticado.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Iniciar sesion
          </h3>
          <StepList>
            <Step n={1}>
              Ingrese a la URL del sistema en su navegador (proporcionada por el
              administrador de sistemas)
            </Step>
            <Step n={2}>
              Introduzca su <strong>usuario</strong> y <strong>clave</strong> en
              los campos correspondientes
            </Step>
            <Step n={3}>
              Haga clic en <strong>Iniciar Sesion</strong> o presione{" "}
              <Kbd>Enter</Kbd>
            </Step>
          </StepList>

          <InfoBox type="info">
            El usuario por defecto es{" "}
            <Code>admin</Code> con clave{" "}
            <Code>admin</Code>. Se recomienda
            encarecidamente cambiar la clave tras el primer acceso desde la
            seccion{" "}
            <a href="#usuarios" className="font-medium text-blue-600 hover:underline">
              Usuarios
            </a>.
          </InfoBox>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Cerrar sesion
          </h3>
          <p>
            Para cerrar sesion, haga clic en el boton{" "}
            <strong>Salir</strong> ubicado en la parte inferior de la barra
            lateral izquierda, junto a su nombre de usuario.
          </p>

          <ImagePlaceholder name="login" caption="Pantalla de inicio de sesion" size="md" />
        </Section>

        {/* ── 3. Navegacion ── */}
        <Section id="navegacion" icon={ChevronRight} title="Navegacion" number={3}>
          <p>
            Una vez autenticado, el sistema muestra un <strong>sidebar
            lateral</strong> (barra de navegacion) a la izquierda que permanece
            visible en todas las pantallas. Desde alli puede acceder a cualquier
            seccion con un clic.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Secciones del sidebar
          </h3>
          <div className="my-4 space-y-1">
            <NavItem icon={LayoutDashboard} label="Dashboard" desc="Pantalla principal con estado general" />
            <NavItem icon={Film} label="Videos" desc="Subir y gestionar videos del repositorio" />
            <NavItem icon={ListMusic} label="Playlists" desc="Crear y editar playlists de videos" />
            <NavItem icon={Monitor} label="Llamadores" desc="Dispositivos registrados y su configuracion" />
            <NavItem icon={MapPin} label="Ubicaciones" desc="ABM de ubicaciones principales" />
            <NavItem icon={BarChart3} label="Estadisticas" desc="Historial de reproducciones de videos" />
            <NavItem icon={Users} label="Usuarios" desc="Gestion de cuentas de acceso (solo admin)" />
            <NavItem icon={Database} label="Base de Datos" desc="Backup, restauracion y reinicio (solo admin)" />
          </div>

          <InfoBox type="info">
            Las secciones <strong>Usuarios</strong> y <strong>Base de
            Datos</strong> solo son visibles para usuarios con rol{" "}
            <strong>admin</strong>. Los usuarios con rol &quot;user&quot; no
            ven estas opciones en el sidebar ni pueden acceder a sus URLs
            directamente.
          </InfoBox>

          <p className="mt-4">
            La seccion activa se resalta con fondo azul. En la parte inferior
            del sidebar se muestra el nombre del usuario autenticado y el boton
            para cerrar sesion.
          </p>
        </Section>

        {/* ── 4. Dashboard ── */}
        <Section id="dashboard" icon={LayoutDashboard} title="Dashboard" number={4}>
          <p>
            El Dashboard es la pantalla principal del sistema. Proporciona una
            vision general y en tiempo real del estado de todo el ecosistema
            de llamadores.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Tarjetas de Resumen
          </h3>
          <p>
            En la parte superior se muestran cuatro tarjetas con metricas clave
            del sistema:
          </p>
          <div className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniCard icon={Film} label="Videos" desc="Total de videos subidos al repositorio" color="blue" />
            <MiniCard icon={HardDrive} label="Espacio Usado" desc="Almacenamiento consumido por los videos" color="purple" />
            <MiniCard icon={ListMusic} label="Playlists" desc="Playlists creadas en el sistema" color="green" />
            <MiniCard icon={Wifi} label="Online" desc="Llamadores conectados sobre el total" color="emerald" />
          </div>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Estado de Llamadores por Ubicacion
          </h3>
          <p>
            Debajo de las tarjetas, los llamadores se muestran{" "}
            <strong>agrupados por ubicacion principal</strong> (centro medico,
            sucursal, etc.). Los que no tienen ubicacion asignada aparecen al
            final bajo el grupo &quot;Sin ubicacion&quot;.
          </p>
          <p className="mt-3">
            Cada grupo muestra un encabezado con el nombre de la ubicacion y la
            cantidad de llamadores online sobre el total. Dentro de cada grupo,
            cada tarjeta de llamador muestra:
          </p>
          <ul className="my-3 space-y-1">
            <Feature>
              <strong>Nombre</strong> del llamador y <strong>estado</strong> con
              indicador de color
            </Feature>
            <Feature>
              <strong>Direccion IP</strong> del dispositivo
            </Feature>
            <Feature>
              <strong>Playlist asignada</strong> con la cantidad de videos que
              contiene
            </Feature>
            <Feature>
              <strong>Cache:</strong> cuantos videos tiene descargados vs. el
              total de la playlist
            </Feature>
            <Feature>
              <strong>Video actual:</strong> nombre del video que se esta
              reproduciendo en este momento
            </Feature>
            <Feature>
              <strong>Ultimo contacto:</strong> tiempo transcurrido desde la
              ultima comunicacion (ej: &quot;hace 2 min&quot;)
            </Feature>
          </ul>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Estados posibles de un llamador
          </h3>
          <div className="my-4 space-y-2">
            <StatusBadge color="green" label="Online" desc="El llamador se comunico hace menos de 10 minutos" />
            <StatusBadge color="red" label="Offline" desc="Han pasado mas de 10 minutos sin comunicacion" />
            <StatusBadge color="blue" label="Sincronizando" desc="El llamador esta descargando videos" />
            <StatusBadge color="yellow" label="Error sync" desc="Hubo un error en la sincronizacion del cache" />
            <StatusBadge color="gray" label="Sin conexion" desc="El llamador nunca se comunico con el servidor" />
          </div>

          <InfoBox type="info">
            El dashboard se actualiza automaticamente cada <strong>30
            segundos</strong>. Tambien puede forzar una actualizacion con el
            boton <InlineIcon icon={RefreshCw} />.
          </InfoBox>

          <ImagePlaceholder name="dashboard" caption="Dashboard con tarjetas de resumen y llamadores agrupados por ubicacion" />
        </Section>

        {/* ── 5. Videos ── */}
        <Section id="videos" icon={Film} title="Videos" number={5}>
          <p>
            En esta seccion se gestiona el repositorio central de videos. Los
            videos subidos quedan disponibles para ser agregados a las playlists
            que luego se asignan a los llamadores.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Subir Videos
          </h3>
          <StepList>
            <Step n={1}>
              Haga clic en el boton{" "}
              <InlineButton icon={Upload} label="Subir Video" /> en la parte
              superior derecha
            </Step>
            <Step n={2}>
              Se despliega el panel de subida con tres campos:
              <ul className="mt-2 ml-4 space-y-1">
                <Feature>
                  <strong>Descripcion</strong> (opcional): texto descriptivo
                  que se aplicara a todos los archivos seleccionados
                </Feature>
                <Feature>
                  <strong>Tipo</strong>: categoria del video — Institucionales,
                  Marketing, Publicidad u Otros
                </Feature>
                <Feature>
                  <strong>Archivos</strong>: seleccione uno o varios archivos
                  de video (MP4, AVI, MKV, MOV, WebM, OGG, etc.)
                </Feature>
              </ul>
            </Step>
            <Step n={3}>
              Haga clic en{" "}
              <InlineButton icon={Upload} label="Subir" /> para iniciar la
              transferencia. Se muestra una barra de progreso general y el
              estado individual de cada archivo.
            </Step>
          </StepList>

          <InfoBox type="info">
            El sistema calcula un hash SHA-256 de cada archivo para detectar
            duplicados. Si intenta subir un video que ya existe, se le
            notificara.
          </InfoBox>

          <InfoBox type="tip">
            Puede seleccionar multiples archivos a la vez. El tamano maximo
            recomendado es de 500 MB por archivo.
          </InfoBox>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Grilla de Videos
          </h3>
          <p>
            Debajo del panel de subida se muestra la grilla con todos los videos
            del repositorio. Las columnas disponibles son:
          </p>
          <ul className="my-3 space-y-1">
            <Feature>
              <strong>Nombre original</strong> — Nombre del archivo subido
            </Feature>
            <Feature>
              <strong>Tamano</strong> — Peso del archivo (KB, MB, GB)
            </Feature>
            <Feature>
              <strong>Subido</strong> — Fecha y hora de subida
            </Feature>
            <Feature>
              <strong>Tipo</strong> — Categoria del video (editable con
              selector desplegable)
            </Feature>
            <Feature>
              <strong>Descripcion</strong> — Texto descriptivo (editable con
              boton de lapiz)
            </Feature>
            <Feature>
              <strong>Acciones</strong> — Ver preview y eliminar
            </Feature>
          </ul>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Acciones por video
          </h3>
          <ul className="my-3 space-y-1">
            <Feature>
              <InlineIcon icon={Eye} /> <strong>Preview:</strong> Abre un modal
              con el reproductor de video para ver su contenido
            </Feature>
            <Feature>
              <InlineIcon icon={Pencil} /> <strong>Editar descripcion:</strong>{" "}
              Haga clic en el icono de lapiz junto a la descripcion para
              editarla inline. Confirme con{" "}
              <InlineIcon icon={Check} /> o cancele con{" "}
              <InlineIcon icon={Trash2} />
            </Feature>
            <Feature>
              <InlineIcon icon={Trash2} /> <strong>Eliminar:</strong>{" "}
              Elimina el video del repositorio (pide confirmacion)
            </Feature>
          </ul>

          <InfoBox type="warning">
            Al eliminar un video, se elimina tambien de <strong>todas las
            playlists</strong> que lo contienen. Esta accion no se puede
            deshacer.
          </InfoBox>

          <ImagePlaceholder name="videos" caption="Pantalla de gestion de videos con panel de subida y grilla" />
        </Section>

        {/* ── 6. Playlists ── */}
        <Section id="playlists" icon={ListMusic} title="Playlists" number={6}>
          <p>
            Las playlists organizan los videos que se reproduciran en cada
            llamador. Cada llamador tiene asignada una unica playlist. Una
            misma playlist puede estar asignada a multiples llamadores.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Listado de Playlists
          </h3>
          <p>
            La pantalla muestra todas las playlists en tarjetas. Cada tarjeta
            indica:
          </p>
          <ul className="my-3 space-y-1">
            <Feature>Nombre y descripcion de la playlist</Feature>
            <Feature>Cantidad de videos que contiene</Feature>
            <Feature>
              Llamadores asignados (con icono <InlineIcon icon={Monitor} /> y
              nombre de cada uno)
            </Feature>
          </ul>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Crear una Playlist
          </h3>
          <StepList>
            <Step n={1}>
              Haga clic en{" "}
              <InlineButton icon={Plus} label="Nueva Playlist" />
            </Step>
            <Step n={2}>
              Ingrese un <strong>nombre</strong> descriptivo (ej: &quot;Videos
              Sala de Espera Planta Baja&quot;) y opcionalmente una{" "}
              <strong>descripcion</strong>
            </Step>
            <Step n={3}>
              Haga clic en <strong>Crear</strong>
            </Step>
          </StepList>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Editar nombre y descripcion
          </h3>
          <p>
            Al pasar el mouse sobre una tarjeta de playlist, aparecen dos
            iconos en la esquina superior derecha:
          </p>
          <ul className="my-3 space-y-1">
            <Feature>
              <InlineIcon icon={Pencil} /> Editar nombre y descripcion en un
              modal
            </Feature>
            <Feature>
              <InlineIcon icon={Trash2} /> Eliminar la playlist (muestra
              advertencia si tiene llamadores asignados)
            </Feature>
          </ul>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Editor de Playlist (Detalle)
          </h3>
          <p>
            Al hacer clic en la tarjeta de una playlist se abre el{" "}
            <strong>Editor de Playlist</strong>, una pantalla dividida en dos
            columnas:
          </p>

          <div className="my-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-blue-50 p-4">
              <h4 className="mb-2 font-semibold text-blue-800">
                Columna izquierda: Playlist Actual
              </h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>Lista ordenada de videos en la playlist</li>
                <li>Cada video muestra nombre, descripcion y tamano</li>
                <li>
                  Botones <InlineIcon icon={ArrowUp} /> para reordenar
                </li>
                <li>
                  Boton <InlineIcon icon={Trash2} /> para quitar de la
                  playlist
                </li>
              </ul>
            </div>
            <div className="rounded-lg border bg-green-50 p-4">
              <h4 className="mb-2 font-semibold text-green-800">
                Columna derecha: Catalogo de Videos
              </h4>
              <ul className="space-y-1 text-sm text-green-700">
                <li>Todos los videos disponibles en el repositorio</li>
                <li>Cada video muestra nombre, descripcion y tamano</li>
                <li>
                  Boton <strong>Agregar</strong> para incluirlo en la
                  playlist
                </li>
              </ul>
            </div>
          </div>

          <StepList>
            <Step n={1}>
              Seleccione videos del <strong>catalogo</strong> (derecha) y
              haga clic en <strong>Agregar</strong> para incluirlos
            </Step>
            <Step n={2}>
              Reordene los videos con las flechas{" "}
              <InlineIcon icon={ArrowUpDown} /> arriba/abajo
            </Step>
            <Step n={3}>
              Haga clic en{" "}
              <InlineButton icon={Check} label="Guardar" /> para aplicar los
              cambios
            </Step>
          </StepList>

          <InfoBox type="tip">
            Un mismo video puede agregarse multiples veces a una playlist si
            desea que se repita durante la reproduccion.
          </InfoBox>

          <ImagePlaceholder name="playlists" caption="Vista de tarjetas de playlists" />
          <ImagePlaceholder name="playlist-editor" caption="Editor de playlist con columnas de playlist actual y catalogo" />
        </Section>

        {/* ── 7. Llamadores ── */}
        <Section id="llamadores" icon={Monitor} title="Llamadores" number={7}>
          <p>
            La pantalla de Llamadores muestra todos los dispositivos registrados
            en una grilla avanzada con capacidades de filtrado, ordenamiento,
            agrupamiento y exportacion.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Grilla de Llamadores
          </h3>
          <p>Las columnas disponibles son:</p>
          <ul className="my-3 space-y-1">
            <Feature>
              <strong>Nombre</strong> — Con indicador circular de estado
              (verde = online, gris = offline)
            </Feature>
            <Feature>
              <strong>Ubicacion Principal</strong> — Centro medico o sucursal
              asignada
            </Feature>
            <Feature>
              <strong>Ubicacion Secundaria</strong> — Detalle (piso,
              consultorio, etc.)
            </Feature>
            <Feature>
              <strong>Playlist</strong> — Nombre de la playlist asignada con
              cantidad de videos
            </Feature>
            <Feature>
              <strong>Layout</strong> — Orientacion de pantalla (Horizontal o
              Vertical)
            </Feature>
            <Feature>
              <strong>Marca/Modelo TV</strong> — Informacion del televisor
            </Feature>
            <Feature>
              <strong>Resolucion</strong> — Resolucion de pantalla configurada
            </Feature>
            <Feature>
              <strong>IP</strong> — Direccion IP del dispositivo
            </Feature>
            <Feature>
              <strong>Ultimo contacto</strong> — Tiempo desde la ultima
              comunicacion
            </Feature>
            <Feature>
              <strong>Observacion</strong> — Notas adicionales
            </Feature>
            <Feature>
              <strong>Acciones</strong> — Configurar y eliminar
            </Feature>
          </ul>

          <InfoBox type="tip">
            Puede <strong>arrastrar columnas</strong> al panel &quot;Row
            Group&quot; en la parte superior de la grilla para agrupar los
            llamadores. Por ejemplo, arrastre &quot;Ubicacion Principal&quot;
            para ver todos los llamadores de cada centro agrupados juntos, o
            &quot;Layout&quot; para verlos por orientacion de pantalla.
          </InfoBox>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Agregar un Llamador
          </h3>
          <p>
            Los llamadores se registran <strong>automaticamente</strong> la
            primera vez que se conectan al servidor. Si necesita registrar uno
            manualmente:
          </p>
          <StepList>
            <Step n={1}>
              Haga clic en{" "}
              <InlineButton icon={Plus} label="Agregar Llamador" />
            </Step>
            <Step n={2}>
              Ingrese el nombre del llamador (ej: &quot;llamador3ero&quot;)
            </Step>
            <Step n={3}>
              Haga clic en <strong>Crear</strong> o presione <Kbd>Enter</Kbd>
            </Step>
          </StepList>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Configurar un Llamador
          </h3>
          <p>
            Haga clic en el icono <InlineIcon icon={Settings} /> de la columna
            Acciones para abrir el modal de configuracion. Los campos editables
            son:
          </p>
          <ul className="my-3 space-y-2">
            <Feature>
              <strong>Playlist asignada</strong> — Seleccione de la lista
              desplegable de playlists disponibles, o elija &quot;Sin
              playlist&quot; para no asignar ninguna
            </Feature>
            <Feature>
              <strong>Foto del dispositivo</strong> — Suba una imagen del
              equipo o su ubicacion. Puede usar la camara del dispositivo o
              seleccionar un archivo. Haga clic en la imagen para verla
              ampliada.
            </Feature>
            <Feature>
              <strong>Ubicacion Principal</strong> — Seleccione de la lista de
              ubicaciones registradas (las que se crean en el{" "}
              <a href="#ubicaciones" className="font-medium text-blue-600 hover:underline">
                ABM de Ubicaciones
              </a>
              )
            </Feature>
            <Feature>
              <strong>Ubicacion Secundaria</strong> — Texto libre para detalles
              adicionales (ej: &quot;2do Piso&quot;, &quot;Consultorio
              308&quot;)
            </Feature>
            <Feature>
              <strong>Layout</strong> — Horizontal o Vertical segun la
              orientacion de la pantalla
            </Feature>
            <Feature>
              <strong>Marca/Modelo TV</strong> — Informacion del televisor
            </Feature>
            <Feature>
              <strong>Resolucion de pantalla</strong> — Por ejemplo
              &quot;1920x1080&quot;
            </Feature>
            <Feature>
              <strong>Observaciones</strong> — Notas libres sobre el equipo
            </Feature>
          </ul>

          <InfoBox type="info">
            Los cambios se guardan al hacer clic en{" "}
            <strong>Guardar</strong>. Los llamadores sincronizaran la nueva
            configuracion (playlist, etc.) en su proximo contacto con el
            servidor.
          </InfoBox>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Eliminar un Llamador
          </h3>
          <p>
            Haga clic en el icono <InlineIcon icon={Trash2} /> en la columna
            Acciones. Se pedira confirmacion antes de proceder. Al eliminar un
            llamador se pierde su configuracion y estadisticas asociadas.
          </p>

          <ImagePlaceholder name="llamadores" caption="Grilla de llamadores con filtros, agrupamiento y botones de exportacion" />
          <ImagePlaceholder name="llamador-config" caption="Modal de configuracion de un llamador" />

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Configuracion Central del Llamador
          </h3>
          <p>
            Ademas de los campos basicos del dispositivo (playlist, ubicacion,
            layout, etc.), cada llamador puede tener una{" "}
            <strong>Configuracion Central</strong> que controla su apariencia
            y comportamiento: marquesina, clima, video y voz. Esta
            configuracion se gestiona desde el repositorio y se sincroniza
            automaticamente al llamador.
          </p>
          <p className="mt-3">
            En el modal de configuracion, debajo de los campos basicos,
            encontrara el acordeon{" "}
            <strong>Configuracion Central</strong>. Haga clic para expandirlo.
            Si el llamador ya tiene configuracion activa, vera la etiqueta
            verde <span className="mx-1 inline-block rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">ACTIVA</span>{" "}
            junto al titulo.
          </p>

          <h4 className="mb-2 mt-4 font-semibold text-gray-700">
            Pestañas del editor
          </h4>
          <p>
            El editor organiza la configuracion en pestañas. Cada pestaña
            muestra un numero con la cantidad de campos configurados. Los
            tipos de campos incluyen texto, numeros, colores (con selector
            visual), booleanos (toggle) y selectores desplegables.
          </p>
          <div className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <MiniCard icon={Tv} label="Marquesina" desc="Texto, colores, fuente, alto" color="blue" />
            <MiniCard icon={Clock} label="Clima" desc="Ciudad, fecha/hora, colores" color="green" />
            <MiniCard icon={Film} label="Video" desc="Silenciar audio global" color="purple" />
            <MiniCard icon={Settings} label="Voz" desc="TTS, idioma, ding-dong" color="emerald" />
            <MiniCard icon={FileText} label="JSON" desc="Vista raw completa" color="blue" />
          </div>

          <p className="mt-2 font-medium text-gray-700">Marquesina</p>
          <p>
            Configura el texto que se desplaza en la parte superior o inferior
            de la pantalla del llamador. Campos: texto del mensaje, color de
            texto, color de fondo, fuente tipografica, tamaño en pixeles,
            estilo (normal, negrita, italica) y porcentaje de alto de pantalla
            que ocupa.
          </p>

          <p className="mt-3 font-medium text-gray-700">Clima</p>
          <p>
            Configura el widget de clima y fecha/hora. Campos: ciudad y pais
            (ej: &quot;Ramos Mejia,AR&quot;), mostrar fecha/hora, formato 24h o 12h,
            tamaño de fuente, porcentaje de alto, y colores de fondo y texto
            independientes para ubicacion y clima.
          </p>

          <p className="mt-3 font-medium text-gray-700">Video</p>
          <p>
            Control global de audio: permite silenciar los videos en el
            llamador. Al activar la configuracion de video, automaticamente se
            habilita el uso del repositorio central.
          </p>

          <p className="mt-3 font-medium text-gray-700">Voz</p>
          <p>
            Configura los anuncios de voz (TTS) al llamar pacientes. Campos:
            habilitar/deshabilitar voz, seleccion de voz TTS (Amazon Polly
            Neural/Standard o Piper local via Docker), codigo de idioma (ej:
            es-AR), activar sonido ding-dong previo al anuncio, pausa en
            segundos despues del anuncio, y ruta al archivo de sonido
            ding-dong.
          </p>

          <p className="mt-3 font-medium text-gray-700">JSON</p>
          <p>
            Muestra la configuracion completa en formato JSON editable.
            Permite revision avanzada o edicion directa del contenido raw.
            Los cambios realizados en JSON se reflejan en las demas pestañas
            y viceversa.
          </p>

          <ImagePlaceholder name="llamador-config-tabs" caption="Editor de Configuracion Central con la pestaña Marquesina activa" />

          <h4 className="mb-2 mt-5 font-semibold text-gray-700">
            Importar configuracion desde llamador
          </h4>
          <p>
            Si un llamador fue configurado localmente (editando su archivo
            YAML directamente), puede importar esa configuracion al
            repositorio central con el boton{" "}
            <InlineButton icon={Download} label="Importar desde llamador" />{" "}
            en la barra de pestañas del editor. El sistema descarga la
            configuracion que el llamador reporto en su ultimo heartbeat y la
            carga en el editor. Si ya existe configuracion central, se pedira
            confirmacion antes de reemplazarla.
          </p>

          <h4 className="mb-2 mt-4 font-semibold text-gray-700">
            Limpiar configuracion
          </h4>
          <p>
            El boton <span className="font-medium text-red-600">Limpiar todo</span>{" "}
            elimina toda la configuracion central del llamador. Esto hace que
            el llamador vuelva a usar su configuracion local (archivo YAML)
            sin overrides del repositorio.
          </p>

          <h4 className="mb-2 mt-4 font-semibold text-gray-700">
            Flujo de sincronizacion
          </h4>
          <p>
            Al guardar, la configuracion se almacena en el repositorio central.
            Los llamadores configurados para usar el repositorio central
            consultan periodicamente (intervalo configurable, por defecto 5
            minutos) si hay cambios. Cuando detectan una configuracion
            central, la aplican como override sobre su configuracion local:
          </p>
          <div className="my-3 flex items-center gap-2 text-sm text-gray-600">
            <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">YAML local</span>
            <span>&lt;</span>
            <span className="rounded bg-blue-100 px-2 py-1 font-mono text-xs">Config central</span>
            <span>&lt;</span>
            <span className="rounded bg-amber-100 px-2 py-1 font-mono text-xs">Variables de entorno</span>
          </div>
          <p className="text-sm text-gray-500">
            Prioridad de menor a mayor: la configuracion local es la base,
            la central la sobreescribe, y las variables de entorno tienen
            maxima prioridad.
          </p>

          <InfoBox type="info">
            Los cambios en el editor no afectan al llamador de forma
            inmediata. Se aplican en el proximo ciclo de sincronizacion
            automatica. Para verificar, puede comprobar el campo
            &quot;Ultima sincronizacion&quot; en la grilla de llamadores.
          </InfoBox>

          <ImagePlaceholder name="llamador-config-voz" caption="Pestaña Voz: configuracion de TTS, idioma y sonido ding-dong" />
        </Section>

        {/* ── 8. Ubicaciones ── */}
        <Section id="ubicaciones" icon={MapPin} title="Ubicaciones" number={8}>
          <p>
            El ABM (Alta, Baja y Modificacion) de Ubicaciones permite gestionar
            las ubicaciones principales donde se encuentran los llamadores:
            centros medicos, sucursales, edificios, etc.
          </p>
          <p className="mt-3">
            Las ubicaciones creadas aqui aparecen como opciones en el selector
            &quot;Ubicacion Principal&quot; al{" "}
            <a href="#llamadores" className="font-medium text-blue-600 hover:underline">
              configurar un llamador
            </a>
            , y se usan para agrupar los llamadores en el{" "}
            <a href="#dashboard" className="font-medium text-blue-600 hover:underline">
              Dashboard
            </a>.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Agregar una ubicacion
          </h3>
          <StepList>
            <Step n={1}>
              Haga clic en{" "}
              <InlineButton icon={Plus} label="Agregar" />
            </Step>
            <Step n={2}>
              Ingrese el nombre (ej: &quot;Centro Belgrano 136&quot;,
              &quot;Sucursal Norte&quot;)
            </Step>
            <Step n={3}>
              Haga clic en <strong>Crear</strong> o presione <Kbd>Enter</Kbd>
            </Step>
          </StepList>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Editar una ubicacion
          </h3>
          <p>
            Haga clic en el icono <InlineIcon icon={Pencil} /> de la fila
            que desea modificar. Se abrira un modal donde puede cambiar el
            nombre. Confirme con <strong>Guardar</strong>.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Eliminar una ubicacion
          </h3>
          <p>
            Haga clic en el icono <InlineIcon icon={Trash2} /> de la fila.
            Se pedira confirmacion antes de proceder.
          </p>

          <InfoBox type="warning">
            Si elimina una ubicacion que esta asignada a uno o mas
            llamadores, esos llamadores quedaran sin ubicacion principal.
          </InfoBox>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Grilla
          </h3>
          <p>La grilla muestra las siguientes columnas:</p>
          <ul className="my-3 space-y-1">
            <Feature><strong>ID</strong> — Identificador unico</Feature>
            <Feature><strong>Nombre</strong> — Nombre de la ubicacion</Feature>
            <Feature><strong>Creado</strong> — Fecha y hora de creacion</Feature>
            <Feature><strong>Acciones</strong> — Editar y Eliminar</Feature>
          </ul>

          <ImagePlaceholder name="ubicaciones" caption="ABM de ubicaciones principales" />
        </Section>

        {/* ── 9. Estadisticas ── */}
        <Section id="estadisticas" icon={BarChart3} title="Estadisticas" number={9}>
          <p>
            La seccion de Estadisticas permite consultar el historial completo
            de reproduccion de videos en todos los llamadores. Es util para
            verificar que los videos se estan reproduciendo correctamente y
            analizar patrones de uso.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Filtros
          </h3>
          <p>
            En la parte superior de la pantalla se encuentran los filtros para
            acotar los resultados:
          </p>
          <ul className="my-3 space-y-1">
            <Feature>
              <InlineIcon icon={Calendar} /> <strong>Desde</strong> — Fecha
              inicial del rango de consulta
            </Feature>
            <Feature>
              <InlineIcon icon={Calendar} /> <strong>Hasta</strong> — Fecha
              final del rango de consulta
            </Feature>
            <Feature>
              <InlineIcon icon={Monitor} /> <strong>Llamador</strong> —
              Seleccione un llamador especifico o &quot;Todos&quot;
            </Feature>
            <Feature>
              <InlineIcon icon={Search} /> <strong>Busqueda rapida</strong> —
              Texto libre para filtrar en todas las columnas
            </Feature>
          </ul>
          <p className="mt-3">
            Si hay filtros activos, aparece un boton{" "}
            <strong>Limpiar filtros</strong> para volver al estado original.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Datos de la grilla
          </h3>
          <p>Cada fila representa una reproduccion de un video e incluye:</p>
          <ul className="my-3 space-y-1">
            <Feature>
              <strong>Video</strong> — Nombre del archivo reproducido
            </Feature>
            <Feature>
              <strong>Tipo</strong> — Categoria del video (Institucional,
              Marketing, etc.)
            </Feature>
            <Feature>
              <strong>Llamador</strong> — Dispositivo que lo reprodujo
            </Feature>
            <Feature>
              <strong>Ubicacion Principal</strong> y{" "}
              <strong>Ubicacion Secundaria</strong>
            </Feature>
            <Feature>
              <strong>Fecha/Hora</strong> — Momento exacto de la reproduccion
            </Feature>
            <Feature>
              <strong>Duracion</strong> — Tiempo de reproduccion en segundos
            </Feature>
          </ul>

          <p className="mt-3">
            En la barra inferior se muestra el <strong>total de
            reproducciones</strong> (respetando los filtros aplicados).
          </p>

          <InfoBox type="tip">
            Arrastre columnas al panel &quot;Row Group&quot; para obtener
            agrupaciones utiles. Por ejemplo, agrupe por{" "}
            <strong>Llamador</strong> para ver cuantas reproducciones tuvo
            cada dispositivo, o por <strong>Tipo</strong> para ver la
            distribucion por categoria.
          </InfoBox>

          <ImagePlaceholder name="estadisticas" caption="Estadisticas de reproduccion con filtros y agrupamiento" />
        </Section>

        {/* ── 10. Usuarios ── */}
        <Section id="usuarios" icon={Users} title="Usuarios" number={10}>
          <p>
            Administracion de las cuentas de usuario que pueden acceder al panel
            de administracion. Esta seccion solo es accesible para usuarios con
            rol <strong>admin</strong>.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Roles de usuario
          </h3>
          <p>
            El sistema maneja dos roles de acceso:
          </p>
          <div className="my-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg border bg-purple-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-purple-800">Admin</h4>
              </div>
              <p className="text-sm text-purple-700">
                Acceso completo a todas las secciones, incluyendo Usuarios y
                Base de Datos. Puede crear y gestionar otros usuarios y
                cambiar roles.
              </p>
            </div>
            <div className="rounded-lg border bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-600" />
                <h4 className="font-semibold text-gray-800">Usuario</h4>
              </div>
              <p className="text-sm text-gray-600">
                Acceso a Dashboard, Videos, Playlists, Llamadores, Ubicaciones
                y Estadisticas. No puede ver Usuarios ni Base de Datos.
              </p>
            </div>
          </div>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Crear un usuario
          </h3>
          <StepList>
            <Step n={1}>
              Haga clic en{" "}
              <InlineButton icon={Plus} label="Nuevo Usuario" />
            </Step>
            <Step n={2}>
              Ingrese un <strong>nombre de usuario</strong>, una{" "}
              <strong>clave</strong> (minimo 4 caracteres) y seleccione el{" "}
              <strong>rol</strong> (Admin o Usuario)
            </Step>
            <Step n={3}>
              Haga clic en <strong>Crear</strong>
            </Step>
          </StepList>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Cambiar rol
          </h3>
          <p>
            En la columna <strong>Rol</strong> de la grilla, cada usuario
            muestra un badge de color: purpura para <strong>Admin</strong> y
            gris para <strong>Usuario</strong>. Para cambiar el rol de un
            usuario, haga clic en el boton{" "}
            <InlineButton icon={Shield} label="Hacer Admin" /> o{" "}
            <InlineButton icon={Shield} label="Quitar Admin" /> en la columna
            de acciones.
          </p>

          <InfoBox type="warning">
            No se puede quitar el rol admin al usuario <Code>admin</Code>{" "}
            original del sistema. Este usuario siempre mantiene el rol de
            administrador.
          </InfoBox>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Cambiar clave
          </h3>
          <p>
            Haga clic en el boton{" "}
            <InlineButton icon={KeyRound} label="Clave" /> de la fila
            del usuario. Se abre un modal donde ingresa la nueva clave (minimo
            4 caracteres) y confirma con <strong>Guardar</strong>.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Eliminar un usuario
          </h3>
          <p>
            Haga clic en el icono <InlineIcon icon={Trash2} /> de la fila del
            usuario. Se pedira confirmacion.
          </p>

          <InfoBox type="warning">
            No se puede eliminar el usuario <Code>admin</Code> ni el usuario
            con el que esta actualmente logueado. El usuario actual se
            identifica con una etiqueta azul &quot;tu&quot; junto a su nombre.
          </InfoBox>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Grilla
          </h3>
          <p>La grilla de usuarios muestra:</p>
          <ul className="my-3 space-y-1">
            <Feature>
              <strong>Usuario</strong> — Nombre de usuario (con badge
              &quot;tu&quot; si es el actual)
            </Feature>
            <Feature>
              <strong>Rol</strong> — Badge purpura (Admin) o gris (Usuario)
            </Feature>
            <Feature>
              <strong>Creado</strong> — Fecha y hora de creacion de la cuenta
            </Feature>
            <Feature>
              <strong>Acciones</strong> — Cambiar rol, Cambiar clave y
              Eliminar
            </Feature>
          </ul>

          <ImagePlaceholder name="usuarios" caption="Gestion de usuarios con roles, grilla y acciones" />
        </Section>

        {/* ── 11. Base de Datos ── */}
        <Section id="database" icon={Database} title="Base de Datos" number={11}>
          <p>
            La seccion de Base de Datos permite realizar operaciones de respaldo,
            restauracion y reinicio del sistema. Solo es accesible para usuarios
            con rol <strong>admin</strong>. Las operaciones afectan toda
            la informacion almacenada: videos (metadatos), playlists,
            llamadores, ubicaciones, usuarios y estadisticas.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Descargar Backup
          </h3>
          <p>
            Haga clic en <strong>Descargar Backup</strong> para obtener una
            copia del archivo de base de datos SQLite. El archivo descargado
            contiene toda la informacion del sistema y puede usarse para
            restaurar en caso de problemas.
          </p>

          <InfoBox type="tip">
            Se recomienda descargar un backup periodicamente y antes de
            cualquier operacion de restauracion o reinicio.
          </InfoBox>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Restaurar Backup
          </h3>
          <StepList>
            <Step n={1}>
              Haga clic en <strong>Seleccionar Archivo</strong>
            </Step>
            <Step n={2}>
              Elija un archivo de backup previamente descargado (
              <Code>.db</Code>, <Code>.sqlite</Code> o{" "}
              <Code>.sqlite3</Code>)
            </Step>
            <Step n={3}>
              Confirme la operacion en el dialogo de confirmacion
            </Step>
          </StepList>

          <InfoBox type="warning">
            La restauracion <strong>reemplaza TODOS los datos
            actuales</strong> con los del archivo seleccionado. Asegurese de
            descargar un backup del estado actual antes de restaurar.
          </InfoBox>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Backup Programado
          </h3>
          <p>
            El sistema puede realizar backups automaticos diarios. La tarjeta
            verde <strong>Backup Programado</strong> permite configurar:
          </p>
          <ul className="my-3 space-y-1">
            <Feature>
              <strong>Activar/Desactivar</strong> — Toggle para habilitar o
              deshabilitar el backup automatico
            </Feature>
            <Feature>
              <strong>Hora del backup</strong> — Selector de hora (0-23). Por
              defecto se ejecuta a las 3:00 AM
            </Feature>
            <Feature>
              <strong>Retencion</strong> — Cuantos dias conservar los backups
              antiguos (1-90 dias, por defecto 7)
            </Feature>
          </ul>
          <p className="mt-3">
            El boton{" "}
            <InlineButton icon={Play} label="Ejecutar Ahora" />{" "}
            permite disparar un backup manualmente en cualquier momento, sin
            esperar a la hora programada.
          </p>
          <p className="mt-3">
            Debajo de la configuracion se muestra una lista con los{" "}
            <strong>backups existentes</strong>, incluyendo el nombre del
            archivo y su fecha de creacion. Los backups se almacenan en la
            carpeta <Code>data/backups/</Code> del servidor.
          </p>

          <InfoBox type="info">
            Los backups automaticos se crean usando <Code>VACUUM INTO</Code>,
            un metodo seguro que genera una copia consistente de la base de
            datos sin interferir con las operaciones en curso.
          </InfoBox>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Reiniciar Base de Datos
          </h3>
          <p>
            Esta operacion elimina <strong>todos los datos</strong> del sistema
            y lo deja en estado inicial con un unico usuario{" "}
            <Code>admin</Code> / <Code>admin</Code>.
          </p>

          <InfoBox type="warning">
            Esta es una accion <strong>irreversible</strong>. El sistema le
            pedira doble confirmacion y le ofrecera descargar un backup antes
            de proceder. Tras el reinicio se redirige a la pantalla de login.
          </InfoBox>

          <ImagePlaceholder name="database" caption="Pantalla de backup, restauracion, backup programado y reinicio" />
        </Section>

        {/* ── 12. Exportacion de Datos ── */}
        <Section id="exportacion" icon={Download} title="Exportacion de Datos" number={12}>
          <p>
            Todas las grillas del sistema permiten exportar los datos
            visualizados en tres formatos. Los botones de exportacion se
            encuentran en la esquina superior derecha de cada grilla.
          </p>

          <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ExportCard
              format="Excel"
              ext=".xlsx"
              desc="Hoja de calculo con formato y colores. Ideal para analisis de datos, graficos y reportes"
            />
            <ExportCard
              format="PDF"
              ext=".pdf"
              desc="Documento con tabla formateada, listo para imprimir o compartir por email"
            />
            <ExportCard
              format="CSV"
              ext=".csv"
              desc="Texto separado por comas. Compatible con cualquier sistema o planilla de calculo"
            />
          </div>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Grillas que soportan exportacion
          </h3>
          <ul className="my-3 space-y-1">
            <Feature>
              <strong>Videos</strong> — Lista completa de videos del
              repositorio
            </Feature>
            <Feature>
              <strong>Llamadores</strong> — Todos los dispositivos y su
              configuracion
            </Feature>
            <Feature>
              <strong>Ubicaciones</strong> — Listado de ubicaciones
              principales
            </Feature>
            <Feature>
              <strong>Estadisticas</strong> — Historial de reproducciones
              (respeta los filtros aplicados)
            </Feature>
            <Feature>
              <strong>Usuarios</strong> — Listado de cuentas de usuario
            </Feature>
          </ul>

          <InfoBox type="info">
            Los datos exportados respetan los <strong>filtros
            aplicados</strong>. Si tiene un filtro activo, solo se exportaran
            las filas visibles. Si desea exportar todos los datos, limpie los
            filtros antes de exportar.
          </InfoBox>

          <ImagePlaceholder name="exportacion" caption="Botones de exportacion disponibles en cada grilla" />
        </Section>

        {/* ── 13. Funciones de Grilla ── */}
        <Section id="grillas" icon={FileText} title="Funciones de Grilla" number={13}>
          <p>
            Todas las grillas del sistema comparten un conjunto comun de
            funcionalidades avanzadas proporcionadas por AG-Grid. A continuacion
            se describen las mas utiles.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Filtro rapido
          </h3>
          <p>
            El campo <InlineIcon icon={Search} />{" "}
            <strong>Filtro rapido</strong> en la parte superior de cada grilla
            permite buscar texto en todas las columnas simultaneamente. A medida
            que escribe, los resultados se filtran en tiempo real.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Ordenar columnas
          </h3>
          <p>
            Haga clic en el encabezado de cualquier columna para ordenar los
            datos:
          </p>
          <ul className="my-3 space-y-1">
            <Feature>Primer clic: orden ascendente (A→Z, menor→mayor)</Feature>
            <Feature>Segundo clic: orden descendente (Z→A, mayor→menor)</Feature>
            <Feature>Tercer clic: sin orden (vuelve al estado original)</Feature>
          </ul>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Filtrar por columna
          </h3>
          <p>
            Pase el mouse sobre el encabezado de una columna y haga clic en el
            icono de menu (tres lineas). Se abrira un panel con opciones de
            filtrado especificas para esa columna (texto, numero o fecha segun
            el tipo).
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Redimensionar columnas
          </h3>
          <p>
            Arrastre el borde derecho del encabezado de una columna para
            cambiar su ancho. Haga doble clic en el borde para ajustar
            automaticamente al contenido.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Agrupamiento (Row Grouping)
          </h3>
          <p>
            En las grillas que lo soportan (Llamadores, Estadisticas), arrastre
            una columna al panel &quot;Row Group&quot; en la parte superior para
            agrupar los datos por esa columna. Puede agrupar por multiples
            columnas simultaneamente.
          </p>

          <InfoBox type="tip">
            El agrupamiento es especialmente util en Estadisticas para analizar
            reproducciones por video, llamador, ubicacion o tipo de contenido.
          </InfoBox>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Menu contextual
          </h3>
          <p>
            Haga <strong>clic derecho</strong> sobre cualquier celda para
            acceder al menu contextual, que incluye opciones adicionales como
            copiar celdas, copiar filas y exportar.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Paginacion
          </h3>
          <p>
            Las grillas con muchos registros muestran paginacion en la parte
            inferior. Puede navegar entre paginas y ver el total de registros.
          </p>

          <h3 className="mb-3 mt-6 text-lg font-semibold text-gray-800">
            Contador de registros
          </h3>
          <p>
            Junto al filtro rapido se muestra el <strong>Total</strong> de
            registros visibles. Si hay un filtro activo, se muestra tambien
            el total general (ej: &quot;12 de 45&quot;).
          </p>
        </Section>

        {/* Footer */}
        <div className="mt-16 border-t pt-8 text-center">
          <p className="text-sm text-gray-400">
            Video Repository v1.0 — Manual de Usuario
          </p>
          <p className="mt-1 text-xs text-gray-300">
            Para soporte tecnico, contacte al administrador del sistema.
          </p>
          <a
            href="#indice"
            className="mt-4 inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700"
          >
            <ArrowUp className="h-4 w-4" />
            Volver al indice
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Reusable Components ──

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
    <section id={id} className="mb-16 scroll-mt-20">
      <div className="mb-6 flex items-center gap-3 border-b pb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
            Seccion {number}
          </p>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
      </div>
      <div className="text-gray-600 leading-relaxed">{children}</div>
    </section>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
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
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
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
  type: "info" | "warning" | "tip";
  children: React.ReactNode;
}) {
  const styles = {
    info: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-800",
      label: "Nota",
    },
    warning: {
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-800",
      label: "Importante",
    },
    tip: {
      bg: "bg-green-50 border-green-200",
      text: "text-green-800",
      label: "Consejo",
    },
  };

  const s = styles[type];
  return (
    <div className={`my-4 rounded-lg border px-4 py-3 ${s.bg}`}>
      <p className={`text-sm ${s.text}`}>
        <strong>{s.label}:</strong> {children}
      </p>
    </div>
  );
}

function InlineButton({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-sm font-medium text-blue-700">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function InlineIcon({
  icon: Icon,
}: {
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <span className="inline-flex items-center rounded bg-gray-100 p-0.5">
      <Icon className="h-3.5 w-3.5 text-gray-500" />
    </span>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs font-mono font-medium text-gray-700 shadow-sm">
      {children}
    </kbd>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm font-mono">
      {children}
    </code>
  );
}

function NavItem({
  icon: Icon,
  label,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border px-4 py-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
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

function ExportCard({
  format,
  ext,
  desc,
}: {
  format: string;
  ext: string;
  desc: string;
}) {
  return (
    <div className="rounded-lg border bg-gray-50 p-4 text-center">
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">
        <Download className="h-5 w-5 text-gray-600" />
      </div>
      <p className="font-semibold text-gray-800">{format}</p>
      <p className="text-xs font-mono text-gray-400">{ext}</p>
      <p className="mt-1 text-xs text-gray-500">{desc}</p>
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
          src={`/manual/${name}.png`}
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
