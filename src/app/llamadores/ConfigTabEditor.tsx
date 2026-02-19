"use client";

import { useEffect, useState, useCallback } from "react";
import { ScrollText, CloudSun, Film, Volume2, FileJson, Eraser, Download } from "lucide-react";

// ── Field metadata ──

interface FieldMeta {
  key: string;
  label: string;
  type: "text" | "number" | "color" | "boolean" | "select";
  description?: string;
  options?: { value: string; label: string }[];
  fullWidth?: boolean;
}

interface TabDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  fields: FieldMeta[];
}

const MARQUEE_FIELDS: FieldMeta[] = [
  { key: "texto", label: "Texto", type: "text", description: "Texto que scrollea en la marquesina", fullWidth: true },
  { key: "colorFuente", label: "Color Texto", type: "color" },
  { key: "colorFondo", label: "Color Fondo", type: "color" },
  { key: "fuente", label: "Fuente", type: "text" },
  { key: "tamanoFuente", label: "Tamaño (px)", type: "number" },
  { key: "tipoFuente", label: "Tipo Fuente", type: "select", options: [
    { value: "0", label: "Normal" },
    { value: "1", label: "Negrita" },
    { value: "2", label: "Itálica" },
    { value: "3", label: "Negrita + Itálica" },
  ]},
  { key: "porcentajeAlto", label: "Alto (%)", type: "number", description: "Porcentaje del alto de pantalla" },
];

const CLIMA_FIELDS: FieldMeta[] = [
  { key: "ciudad", label: "Ciudad", type: "text", description: "Formato: Ciudad,País (ej: Ramos Mejía,AR)", fullWidth: true },
  { key: "mostrarFechaHora", label: "Mostrar Fecha/Hora", type: "boolean" },
  { key: "formatoHora", label: "Formato Hora", type: "select", options: [
    { value: "24h", label: "24 horas (14:30)" },
    { value: "12h", label: "12 horas (2:30 p.m.)" },
  ]},
  { key: "tamanoFuenteFechaHora", label: "Tamaño Fecha/Hora (px)", type: "number" },
  { key: "porcentajeAlto", label: "Alto (%)", type: "number" },
  { key: "colorFondoIzquierda", label: "Fondo Izq", type: "color" },
  { key: "colorFondoDerecha", label: "Fondo Der", type: "color" },
  { key: "fuenteUbicacion", label: "Fuente Ciudad", type: "text" },
  { key: "tamanoFuenteUbicacion", label: "Tamaño Ciudad (px)", type: "number" },
  { key: "colorFuenteUbicacion", label: "Color Ciudad", type: "color" },
  { key: "fuenteClima", label: "Fuente Datos", type: "text" },
  { key: "tamanoFuenteClima", label: "Tamaño Datos (px)", type: "number" },
  { key: "colorFuenteClima", label: "Color Datos", type: "color" },
];

const VIDEO_FIELDS: FieldMeta[] = [
  { key: "videoMute", label: "Silenciar Video", type: "boolean", description: "Silenciar el audio de los videos en todos los llamadores" },
];

const VOZ_FIELDS: FieldMeta[] = [
  { key: "habilitarVoz", label: "Habilitar Voz", type: "boolean", description: "Desactivar para usar solo ding-dong sin anuncio" },
  { key: "voz", label: "Voz TTS", type: "select", options: [
    { value: "Lucia", label: "Lucia - España (Polly Neural)" },
    { value: "Sergio", label: "Sergio - España (Polly Neural)" },
    { value: "Conchita", label: "Conchita - España (Polly Standard)" },
    { value: "Lupe", label: "Lupe - EEUU (Polly Neural)" },
    { value: "Mia", label: "Mía - México (Polly Neural)" },
    { value: "Pedro", label: "Pedro - EEUU (Polly Neural)" },
    { value: "Andres", label: "Andrés - EEUU (Polly Neural)" },
    { value: "es_ES-davefx-medium", label: "Dave FX - España (Piper)" },
    { value: "es_ES-sharvard-medium", label: "Sharvard - España (Piper)" },
    { value: "es_MX-ald-medium", label: "Ald - México (Piper)" },
    { value: "es_MX-claude-high", label: "Claude - México (Piper)" },
    { value: "es_AR-daniela-high", label: "Daniela - Argentina (Piper)" },
  ], description: "Voces Amazon Polly (con AWS) o Piper TTS (Docker local)" },
  { key: "lenguaje", label: "Idioma", type: "text", description: "Código de idioma (ej: es-AR, es-ES)" },
  { key: "dingDong", label: "Sonido Ding-Dong", type: "boolean", description: "Reproducir sonido antes del anuncio" },
  { key: "segundosPausaVoz", label: "Pausa después del anuncio (seg)", type: "number" },
  { key: "pathDingDong", label: "Ruta Ding-Dong", type: "text", description: "Ruta al archivo de sonido (relativa a /public)" },
];

const TABS: TabDef[] = [
  { id: "marquee", label: "Marquesina", icon: <ScrollText className="h-3.5 w-3.5" />, fields: MARQUEE_FIELDS },
  { id: "clima", label: "Clima", icon: <CloudSun className="h-3.5 w-3.5" />, fields: CLIMA_FIELDS },
  { id: "video", label: "Video", icon: <Film className="h-3.5 w-3.5" />, fields: VIDEO_FIELDS },
  { id: "voz", label: "Voz", icon: <Volume2 className="h-3.5 w-3.5" />, fields: VOZ_FIELDS },
];

// ── Types ──

type SectionData = Record<string, unknown>;
type ConfigData = Record<string, unknown>; // sections (objects) + top-level primitives (layout, intervaloBuscarProximo)

interface ConfigTabEditorProps {
  nombre: string;
  configLoaded: boolean;
  onLoaded: () => void;
  configJsonRef: React.MutableRefObject<string>;
}

// ── Field renderer ──

function renderField(
  field: FieldMeta,
  value: unknown,
  onChange: (val: unknown) => void
) {
  const baseInput = "w-full rounded border px-2 py-1 text-xs";

  switch (field.type) {
    case "text":
      return (
        <input
          type="text"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
        />
      );

    case "number":
      return (
        <input
          type="number"
          value={(value as number) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          className={`${baseInput} w-24`}
        />
      );

    case "color":
      return (
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={(value as string) ?? "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 w-7 cursor-pointer rounded border p-0"
          />
          <input
            type="text"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-20 rounded border px-1.5 py-1 font-mono text-xs"
            placeholder="#000000"
          />
        </div>
      );

    case "boolean":
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-3.5 w-3.5 rounded"
          />
          <span className="text-xs text-gray-600">{value ? "Sí" : "No"}</span>
        </label>
      );

    case "select":
      return (
        <select
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
        >
          <option value="">— seleccionar —</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
  }
}

// ── Main component ──

export default function ConfigTabEditor({
  nombre,
  configLoaded,
  onLoaded,
  configJsonRef,
}: ConfigTabEditorProps) {
  const [activeTab, setActiveTab] = useState("marquee");
  const [configData, setConfigData] = useState<ConfigData>({});
  const [rawJson, setRawJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [importing, setImporting] = useState(false);

  // Build JSON string from configData (handles both section objects and top-level primitives)
  const buildJson = useCallback((data: ConfigData): string => {
    const cleaned: ConfigData = {};
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        // Section with sub-fields (marquee, clima, etc.)
        const section = value as SectionData;
        const nonEmpty: SectionData = {};
        for (const [k, v] of Object.entries(section)) {
          if (v !== undefined && v !== "" && v !== null) {
            nonEmpty[k] = v;
          }
        }
        if (Object.keys(nonEmpty).length > 0) {
          cleaned[key] = nonEmpty;
        }
      } else if (value !== undefined && value !== "" && value !== null) {
        // Top-level primitive (layout, intervaloBuscarProximo)
        cleaned[key] = value;
      }
    }
    // Force usarRepositorioCentral: true when any video field is configured centrally
    if (cleaned.video && typeof cleaned.video === "object") {
      (cleaned.video as SectionData).usarRepositorioCentral = true;
    }
    return Object.keys(cleaned).length > 0 ? JSON.stringify(cleaned, null, 2) : "";
  }, []);

  // Sync configJsonRef whenever configData changes
  const updateFromData = useCallback((data: ConfigData) => {
    setConfigData(data);
    const json = buildJson(data);
    setRawJson(json);
    configJsonRef.current = json;
  }, [buildJson, configJsonRef]);

  // Load config from API
  useEffect(() => {
    if (loaded || configLoaded) return;
    fetch(`/api/config/${encodeURIComponent(nombre)}`)
      .then(async (res) => {
        if (res.ok) {
          const result = await res.json();
          const config = result.config ?? {};
          setConfigData(config);
          const json = JSON.stringify(config, null, 2);
          setRawJson(json === "{}" ? "" : json);
          configJsonRef.current = json === "{}" ? "" : json;
        }
        setLoaded(true);
        onLoaded();
      })
      .catch(() => {
        setLoaded(true);
        onLoaded();
      });
  }, [loaded, configLoaded, nombre, onLoaded, configJsonRef]);

  // Field change handler
  function handleFieldChange(section: string, key: string, value: unknown) {
    const existing = (configData[section] && typeof configData[section] === "object")
      ? configData[section] as SectionData : {};
    const updated = {
      ...configData,
      [section]: { ...existing, [key]: value },
    };
    updateFromData(updated);
  }

  // Handle raw JSON edit
  function handleRawJsonChange(text: string) {
    setRawJson(text);
    if (!text.trim()) {
      setJsonError(null);
      setConfigData({});
      configJsonRef.current = "";
      return;
    }
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed !== "object" || Array.isArray(parsed)) {
        setJsonError("Debe ser un objeto JSON");
        return;
      }
      setJsonError(null);
      setConfigData(parsed);
      configJsonRef.current = text;
    } catch {
      setJsonError("JSON inválido");
    }
  }

  // Clear all config
  function handleClear() {
    setConfigData({});
    setRawJson("");
    setJsonError(null);
    configJsonRef.current = "";
  }

  // Import config reported by the llamador
  async function handleImportFromLlamador() {
    if (hasConfig) {
      const ok = confirm("Ya hay configuración definida. ¿Reemplazarla con la del llamador?");
      if (!ok) return;
    }
    setImporting(true);
    try {
      const res = await fetch(`/api/llamadores/${encodeURIComponent(nombre)}/reported-config`);
      if (res.status === 404) {
        alert("Este llamador no ha reportado su configuración aún.\nAsegúrese de que está conectado y actualizado.");
        return;
      }
      if (!res.ok) {
        alert("Error al obtener la configuración del llamador.");
        return;
      }
      const data = await res.json();
      // Filter: only import section objects (marquee, clima, etc.)
      // Strip top-level primitives (layout, intervaloBuscarProximo) to prevent corruption
      const imported = data.config as ConfigData;
      const sectionsOnly: ConfigData = {};
      for (const [key, value] of Object.entries(imported)) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          sectionsOnly[key] = value;
        }
      }
      updateFromData(sectionsOnly);
    } catch {
      alert("Error de red al contactar la API.");
    } finally {
      setImporting(false);
    }
  }

  const hasConfig = rawJson.trim().length > 0;

  return (
    <div className="mt-3">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon}
            {tab.label}
            {(() => {
              const s = configData[tab.id];
              if (!s || typeof s !== "object") return null;
              const count = Object.keys(s as SectionData).length;
              return count > 0 ? (
                <span className="rounded-full bg-green-100 px-1.5 text-[9px] font-semibold text-green-700">
                  {count}
                </span>
              ) : null;
            })()}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setActiveTab("json")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "json"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileJson className="h-3.5 w-3.5" />
          JSON
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleImportFromLlamador}
          disabled={importing}
          className="flex items-center gap-1 px-2 py-1 text-[10px] text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
          title="Importar la configuración actual que reporta el llamador"
        >
          <Download className="h-3 w-3" />
          {importing ? "Importando..." : "Importar desde llamador"}
        </button>
        {hasConfig && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 px-2 py-1 text-[10px] text-red-500 hover:bg-red-50 rounded"
          >
            <Eraser className="h-3 w-3" />
            Limpiar todo
          </button>
        )}
        {hasConfig && (
          <span className="rounded bg-green-100 px-1.5 py-0.5 text-[9px] font-semibold text-green-700">
            ACTIVA
          </span>
        )}
      </div>

      {/* Tab content */}
      <div className="pt-3">
        {TABS.map((tab) =>
          activeTab === tab.id ? (
            <div key={tab.id} className="grid grid-cols-2 gap-x-4 gap-y-2">
              {tab.fields.map((field) => (
                <div key={field.key} className={field.fullWidth ? "col-span-2" : ""}>
                  <label className="mb-0.5 block text-[11px] font-medium text-gray-600">
                    {field.label}
                  </label>
                  {renderField(
                    field,
                    (configData[tab.id] as SectionData)?.[field.key],
                    (val) => handleFieldChange(tab.id, field.key, val)
                  )}
                  {field.description && (
                    <p className="mt-0.5 text-[10px] text-gray-400">{field.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : null
        )}

        {activeTab === "json" && (
          <div>
            <textarea
              rows={12}
              spellCheck={false}
              value={rawJson}
              onChange={(e) => handleRawJsonChange(e.target.value)}
              className={`w-full rounded-lg border bg-gray-50 px-3 py-2 font-mono text-xs leading-relaxed ${
                jsonError ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:ring-blue-300"
              } focus:outline-none focus:ring-1`}
              placeholder='{ "marquee": { "texto": "..." }, "clima": { "ciudad": "..." } }'
            />
            {jsonError && (
              <p className="mt-1 text-xs text-red-500">{jsonError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
