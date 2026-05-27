import { createClient } from "@supabase/supabase-js";

const STORAGE_KEY = "planta-igen5000-registro-v3";
const CLOUD_KEY_STORAGE = "planta-igen5000-cloud-key";
const SUPABASE_URL = "https://eayaqiqgplvwrxcvxrkn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVheWFxaXFncGx2d3J4Y3Z4cmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MTY5NTcsImV4cCI6MjA5MzQ5Mjk1N30.oi-Zeg8s2B6Or-GohZD4FadFvGnqRESpbXVKnStf8j4";
const CLOUD_TABLE = "planta_sync_states";

const maintenanceRules = [
  {
    id: "oil",
    name: "Cambiar aceite",
    firstName: "Primer cambio de aceite",
    icon: "🛢️",
    priority: 1,
    action: "Cambiar",
    target: "aceite",
    doneLabel: "Cambiado",
    soonLabel: "Por cambiar",
    dueLabel: "Necesita cambio",
    intervalHours: 50,
    intervalDays: 183,
    firstHours: 25,
    firstDays: 30,
    summary: "Primer cambio a las 25 horas o al primer mes. Después, cada 50 horas o 6 meses.",
    manual: "Usa aceite 10W-30. Capacidad máxima: 0.63 qt / 0.60 L. Cambia más frecuente con carga pesada, polvo o mucho calor."
  },
  {
    id: "air-clean",
    name: "Limpiar filtro de aire",
    icon: "🧽",
    priority: 3,
    action: "Limpiar",
    target: "filtro de aire",
    doneLabel: "Limpio",
    soonLabel: "Por limpiar",
    dueLabel: "Necesita limpieza",
    intervalHours: 50,
    intervalDays: 183,
    summary: "Limpiar cada 50 horas o cada 6 meses. En polvo o suciedad, hacerlo más seguido.",
    manual: "Lavar con detergente doméstico y agua tibia, secar, humedecer con aceite limpio y exprimir exceso."
  },
  {
    id: "spark-arrestor",
    name: "Limpiar arrestachispas",
    icon: "✨",
    priority: 4,
    action: "Limpiar",
    target: "arrestachispas",
    doneLabel: "Limpio",
    soonLabel: "Por limpiar",
    dueLabel: "Necesita limpieza",
    intervalHours: 100,
    intervalDays: 183,
    summary: "Inspeccionar y limpiar cada 100 horas o 6 meses.",
    manual: "Retira depósitos de carbón con cepillo de alambre. Cambia la pieza si está rota o dañada."
  },
  {
    id: "spark-inspect",
    name: "Inspeccionar/limpiar bujía",
    icon: "🔌",
    priority: 5,
    action: "Limpiar",
    target: "bujía",
    doneLabel: "Limpia",
    soonLabel: "Por limpiar",
    dueLabel: "Necesita limpieza",
    intervalHours: 100,
    intervalDays: 183,
    summary: "Inspeccionar y limpiar cada 100 horas o 6 meses.",
    manual: "Luz de bujía: 0.024-0.032 pulgadas / 0.60-0.80 mm. Bujía recomendada: 97109 - F7RTC."
  },
  {
    id: "fuel-filter",
    name: "Reemplazar filtro de combustible",
    icon: "⛽",
    priority: 6,
    action: "Cambiar",
    target: "filtro de combustible",
    doneLabel: "Cambiado",
    soonLabel: "Por cambiar",
    dueLabel: "Necesita cambio",
    intervalHours: 100,
    intervalDays: 183,
    summary: "Reemplazar cada 100 horas o 6 meses.",
    manual: "El manual recomienda que este servicio lo haga un centro autorizado Westinghouse."
  },
  {
    id: "valves",
    name: "Inspeccionar/ajustar válvulas",
    icon: "⚙️",
    priority: 7,
    action: "Ajustar",
    target: "válvulas",
    doneLabel: "Ajustadas",
    soonLabel: "Por ajustar",
    dueLabel: "Necesita ajuste",
    intervalHours: 100,
    intervalDays: 183,
    summary: "Inspeccionar o ajustar cada 100 horas o 6 meses.",
    manual: "Admisión: 0.08-0.12 mm. Escape: 0.13-0.17 mm. Hacer con el motor frío."
  },
  {
    id: "spark-replace",
    name: "Reemplazar bujía",
    icon: "🔌",
    priority: 8,
    action: "Cambiar",
    target: "bujía",
    doneLabel: "Cambiada",
    soonLabel: "Por cambiar",
    dueLabel: "Necesita cambio",
    intervalHours: 300,
    intervalDays: 365,
    summary: "Reemplazar cada 300 horas o 1 año.",
    manual: "Usa bujía Westinghouse OEM o compatible tipo resistor. Referencia: 97109 - F7RTC."
  },
  {
    id: "air-replace",
    name: "Reemplazar filtro de aire",
    icon: "🧰",
    priority: 9,
    action: "Cambiar",
    target: "filtro de aire",
    doneLabel: "Cambiado",
    soonLabel: "Por cambiar",
    dueLabel: "Necesita cambio",
    intervalHours: 300,
    intervalDays: 365,
    summary: "Reemplazar cada 300 horas o 1 año.",
    manual: "También reemplázalo antes si ya no se puede limpiar correctamente."
  },
  {
    id: "battery-charge",
    name: "Cargar batería",
    icon: "🔋",
    priority: 2,
    action: "Cargar",
    target: "batería",
    doneLabel: "Cargada",
    soonLabel: "Por cargar",
    dueLabel: "Necesita carga",
    intervalDays: 30,
    summary: "Si la planta no se usa regularmente, cargar la batería una noche al mes.",
    manual: "No dejes el cargador más de 8 horas. Cuando la planta arranca, recarga la batería tras 30-60 minutos de uso."
  }
];

const knowledgeBase = [
  {
    title: "Horas de mantenimiento",
    tags: "horas mantenimiento calendario aceite filtro bujia arrestachispas valvulas",
    body: "El manual indica seguir el intervalo por horas o por calendario, lo que ocurra primero. Aceite inicial: 25 horas o 1 mes. Luego aceite y limpieza de filtro de aire: 50 horas o 6 meses. Bujía, arrestachispas, filtro de combustible y válvulas: 100 horas o 6 meses. Bujía y filtro de aire nuevos: 300 horas o 1 año."
  },
  {
    title: "Aceite",
    tags: "aceite 10w-30 capacidad cambio nivel",
    body: "Aceite recomendado: SAE 10W-30. Capacidad máxima: 0.63 qt / 0.60 L. Para Barquisimeto, por calor, conserva 10W-30 como aceite principal y cambia más frecuente si trabaja con alta temperatura o carga pesada."
  },
  {
    title: "Batería",
    tags: "bateria cargar carga mensual cargador arranque",
    body: "Si no usas la planta regularmente, carga la batería durante la noche una vez al mes. No uses el cargador más de 8 horas. Al estar encendida, la planta recarga la batería después de 30 a 60 minutos de uso."
  },
  {
    title: "Gasolina",
    tags: "gasolina combustible octanaje e10 e15 e85 estabilizador",
    body: "Usa gasolina limpia, fresca, sin plomo, 87-93 octanos. Se permite hasta 10% de etanol, aunque se recomienda sin etanol. No usar E15, E85 ni mezcla gasolina/aceite. El estabilizador ayuda si el combustible va a quedarse guardado."
  },
  {
    title: "Almacenamiento",
    tags: "almacenamiento guardar meses carburador tanque estabilizador",
    body: "Menos de 1 mes: sin servicio especial. De 2 a 6 meses: gasolina fresca con estabilizador y drenar la taza del carburador. 6 meses o más: drenar tanque y carburador."
  },
  {
    title: "Seguridad",
    tags: "seguridad monoxido lluvia distancia exterior escape",
    body: "Usar solo afuera, lejos de puertas, ventanas y ventilaciones. Dirige el escape lejos de espacios ocupados. Mantén al menos 5 pies / 1.5 m de separación alrededor y nunca la uses bajo lluvia o humedad."
  },
  {
    title: "Pantalla digital",
    tags: "pantalla digital horas lifetime data center",
    body: "El centro de datos LED muestra tiempo restante, salida en kW, nivel de combustible, voltaje y horas de vida de la planta. Puedes usar esas horas para registrar el uso real en esta app."
  },
  {
    title: "Repuestos",
    tags: "repuestos partes bujia filtro bateria arandela arrestachispas westinghouse",
    body: "Repuestos de mantenimiento: filtro de aire 5691, arandela de drenaje de aceite 94007, arrestachispas 6790, bujía 97109 - F7RTC, filtro de combustible 516401. En batería, confirma etiqueta porque el manual lista 511019 y la lista de partes 511089."
  }
];

const manualQuickAnswers = [
  ["Aceite", "Primer cambio a las 25 horas o 30 días. Luego cada 50 horas o 6 meses."],
  ["Bujía", "Inspeccionar/limpiar cada 100 horas o 6 meses. Reemplazar cada 300 horas o 1 año. Tipo: F7RTC."],
  ["Filtro de aire", "Limpiar cada 50 horas o 6 meses. Reemplazar cada 300 horas o 1 año, o antes si no limpia bien."],
  ["Batería", "Si no se usa la planta, revisar/cargar mensualmente. No usar el cargador más de 8 horas."],
  ["Arranque", "Verifica batería ON, gasolina fresca, aceite correcto y que no esté sobrecargada."],
  ["Ruido raro", "Apaga la planta si el ruido es fuerte o anormal. Revisa carga conectada y consulta técnico si continúa."],
  ["No prende", "Revisa combustible, nivel de aceite, batería, bujía y filtro de aire. Si persiste, consulta el manual/técnico."],
  ["Sobrecarga", "Desconecta equipos, reinicia la planta y conecta cargas gradualmente sin exceder la capacidad."],
  ["Almacenamiento", "Menos de 1 mes: sin servicio especial. 2 a 6 meses: estabilizador y drenar carburador. 6+ meses: drenar tanque y carburador."]
];

const symptomGuides = [
  ["No prende", "Revisa batería ON, combustible fresco, nivel de aceite y que no esté sobrecargada. No manipules partes internas si no estás seguro."],
  ["Se apaga sola", "Puede ser bajo aceite, combustible contaminado, filtro sucio o sobrecarga. Apaga, deja enfriar y revisa lo básico."],
  ["Huele a gasolina", "No la enciendas. Aléjala de chispas/llamas, ventila el área y revisa si hay derrames. Si persiste, técnico."],
  ["Bota humo", "Apaga si el humo es excesivo. Revisa nivel de aceite y filtro de aire. Si continúa, no la fuerces."],
  ["Suena raro", "Reduce carga y apaga si el sonido sigue. Revisa que esté nivelada y sin objetos sueltos cerca."],
  ["No entrega corriente", "Revisa breaker, sobrecarga y cables/extensiones. No abras partes eléctricas internas."],
  ["Se sobrecarga", "Desconecta equipos, espera un momento, reinicia y conecta de uno en uno."],
  ["Arranca pero falla", "Revisa gasolina fresca, filtro de aire y bujía. Si sigue fallando, consulta técnico."]
];

const careCards = [
  {
    title: "Antes de cada uso",
    body: "Revisa el nivel de aceite, gasolina fresca, ventilación, distancia segura y que no haya lluvia ni humedad."
  },
  {
    title: "Si no la usas",
    body: "Carga la batería una noche al mes, máximo 8 horas. Si pasan 2 meses o más, aplica el protocolo de almacenamiento del combustible."
  },
  {
    title: "Uso para conservar batería",
    body: "El manual dice que, una vez encendida, la planta recarga la batería tras 30-60 minutos de uso. No fija una rutina obligatoria de encendido."
  },
  {
    title: "Datos base",
    body: "3900 W continuos, 5000 W pico, gasolina 87-93 octanos, tanque 3.4 gal / 12.8 L, aceite 10W-30."
  },
  {
    title: "Barquisimeto",
    body: "La planta está clasificada para operación continua hasta 40 °C. Con calor fuerte, ubícala ventilada, con sombra abierta, y considera cambio de aceite mensual si trabaja pesado."
  }
];

const partsList = [
  {
    group: "Aceite",
    name: "Aceite de motor SAE 10W-30",
    part: "Tipo especificado por Westinghouse",
    buy: "Compra aceite 10W-30 para motor 4 tiempos. No uses aceite 2 tiempos ni mezclas gasolina/aceite.",
    details: "Capacidad máxima: 0.63 qt / 0.60 L. En Barquisimeto, por calor y posibles cargas fuertes, mantén 10W-30 como compra principal y cambia el aceite más frecuente si trabaja con mucho calor o carga pesada.",
    source: "Manual iGen5000: especificaciones, llenado inicial y mantenimiento."
  },
  {
    group: "Aceite",
    name: "Arandela del tapón de drenaje de aceite",
    part: "94007",
    buy: "Ten varias de repuesto. El manual recomienda una arandela nueva en cada cambio de aceite.",
    details: "Sirve para sellar el tapón de drenaje al cambiar aceite.",
    source: "Manual iGen5000: piezas de reemplazo de mantenimiento."
  },
  {
    group: "Encendido",
    name: "Bujía",
    part: "97109 - F7RTC",
    buy: "Compra bujía F7RTC tipo resistor o repuesto Westinghouse 97109. Evita bujías sin resistor.",
    details: "Luz/calibración: 0.024-0.032 in / 0.60-0.80 mm. Inspeccionar cada 100 h o 6 meses; reemplazar cada 300 h o 1 año.",
    source: "Manual iGen5000 y lista de repuestos del motor."
  },
  {
    group: "Aire",
    name: "Filtro de aire de espuma",
    part: "5691",
    buy: "Compra filtro de aire foam 5691 para iGen5000.",
    details: "Limpiar cada 50 h o 6 meses; reemplazar si no se puede limpiar bien o cada 300 h/1 año.",
    source: "Manual iGen5000 y lista de repuestos."
  },
  {
    group: "Escape",
    name: "Arrestachispas / pare-chispas",
    part: "6790",
    buy: "Compra arrestachispas Westinghouse 6790 si está roto, rasgado o muy deteriorado.",
    details: "Inspeccionar y limpiar cada 100 h o 6 meses con cepillo de alambre.",
    source: "Manual iGen5000 y lista de repuestos del motor."
  },
  {
    group: "Combustible",
    name: "Filtro de combustible",
    part: "516401",
    buy: "Repuesto de filtro de combustible 516401. El manual recomienda servicio autorizado para esta tarea.",
    details: "Reemplazar cada 100 h o 6 meses según el calendario de mantenimiento.",
    source: "Manual iGen5000 y lista de repuestos del generador."
  },
  {
    group: "Combustible",
    name: "Filtro del tanque de gasolina",
    part: "518801",
    buy: "Filtro de tanque 518801 si se daña o se contamina.",
    details: "El manual indica limpiar el filtro de la boca del tanque antes y después de cargar gasolina.",
    source: "Lista de repuestos iGen5000."
  },
  {
    group: "Batería",
    name: "Batería",
    part: "511019 / 511089",
    buy: "Antes de comprar, confirma la etiqueta de tu batería instalada. El manual de mantenimiento lista 511019 y la lista de repuestos muestra 511089.",
    details: "Si no se usa la planta, cargar una noche al mes. No pasar de 8 horas con el cargador incluido.",
    source: "Manual iGen5000 y lista de repuestos."
  },
  {
    group: "Batería",
    name: "Cargador de batería",
    part: "511043",
    buy: "Cargador 12V incluido/listado para el equipo.",
    details: "No es cargador de mantenimiento continuo. Usarlo máximo 8 horas.",
    source: "Lista de repuestos iGen5000 y sección de batería."
  }
];

const defaultState = {
  createdAt: new Date().toISOString(),
  activePerson: "Ana",
  logs: [],
  services: []
};

let state = loadState();
let editMode = false;
let editTapCount = 0;
let cloudKeyHash = localStorage.getItem(CLOUD_KEY_STORAGE) || "";
let cloudClient = cloudKeyHash ? createCloudClient(cloudKeyHash) : null;
let cloudReady = false;
let cloudSaving = false;
let cloudSaveTimer = null;
let lastCloudUpdatedAt = "";
let cloudWatchStarted = false;

const $ = (selector) => document.querySelector(selector);
const daysBetween = (a, b) => Math.floor((b - a) / 86400000);

function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function nowISO() {
  return new Date().toISOString();
}

function parseStoredDate(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

function formatVenezuelaDateTime(value) {
  const date = parseStoredDate(value);
  const formattedDate = new Intl.DateTimeFormat("es-VE", {
    timeZone: "America/Caracas",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
  const formattedTime = new Intl.DateTimeFormat("es-VE", {
    timeZone: "America/Caracas",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(date);
  return `${formattedDate}, ${formattedTime}`;
}

function loadState() {
  try {
    return { ...structuredClone(defaultState), ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveLocalStateOnly() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateSaveStatus(message) {
  const status = $("#saveStatus");
  if (!status) return;
  status.textContent = message;
}

function localTimeLabel() {
  return new Intl.DateTimeFormat("es-VE", {
    timeZone: "America/Caracas",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(new Date());
}

function saveState() {
  saveLocalStateOnly();
  if (cloudKeyHash) {
    updateSaveStatus(`Guardando nube ${localTimeLabel()}`);
    scheduleCloudSave();
  } else {
    updateSaveStatus(`Local ${localTimeLabel()}`);
  }
}

function createCloudClient(appKeyHash) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        "x-planta-key": appKeyHash
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

async function hashSyncKey(value) {
  const normalized = value.trim();
  const bytes = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeCloudState(data) {
  return {
    ...structuredClone(defaultState),
    ...data,
    logs: Array.isArray(data?.logs) ? data.logs : [],
    services: Array.isArray(data?.services) ? data.services : []
  };
}

function scheduleCloudSave() {
  window.clearTimeout(cloudSaveTimer);
  cloudSaveTimer = window.setTimeout(() => {
    pushCloudState();
  }, 700);
}

async function pushCloudState() {
  if (!cloudClient || !cloudKeyHash || cloudSaving) return;
  cloudSaving = true;
  const updatedAt = new Date().toISOString();
  const { error } = await cloudClient
    .from(CLOUD_TABLE)
    .upsert({
      app_key: cloudKeyHash,
      data: state,
      updated_at: updatedAt
    }, { onConflict: "app_key" });

  cloudSaving = false;
  if (error) {
    console.error(error);
    updateCloudStatus("Error de nube. Revisa conexión.");
    updateSaveStatus(`Pendiente nube ${localTimeLabel()}`);
    return;
  }
  cloudReady = true;
  lastCloudUpdatedAt = updatedAt;
  updateCloudStatus("Sincronización activa");
  updateSaveStatus(`Nube ${localTimeLabel()}`);
}

async function pullCloudState(showToastOnUpdate = false) {
  if (!cloudClient || !cloudKeyHash || cloudSaving) return;
  const { data, error } = await cloudClient
    .from(CLOUD_TABLE)
    .select("data, updated_at")
    .eq("app_key", cloudKeyHash)
    .maybeSingle();

  if (error) {
    console.error(error);
    updateCloudStatus("No se pudo leer la nube.");
    return;
  }

  if (!data) {
    await pushCloudState();
    return;
  }

  if (data.updated_at && data.updated_at !== lastCloudUpdatedAt) {
    state = normalizeCloudState(data.data);
    lastCloudUpdatedAt = data.updated_at;
    saveLocalStateOnly();
    render();
    if (showToastOnUpdate) showToast("Datos actualizados desde la nube");
  }

  cloudReady = true;
  updateCloudStatus("Sincronización activa");
  updateSaveStatus(`Nube ${localTimeLabel()}`);
}

async function connectCloudWithKey(rawKey) {
  if (!rawKey.trim()) {
    showToast("Escribe una clave de sincronización");
    return;
  }
  updateCloudStatus("Conectando...");
  cloudKeyHash = await hashSyncKey(rawKey);
  localStorage.setItem(CLOUD_KEY_STORAGE, cloudKeyHash);
  cloudClient = createCloudClient(cloudKeyHash);
  startCloudWatch();
  await pullCloudState(true);
  renderCloudControls();
}

function disconnectCloud() {
  cloudKeyHash = "";
  cloudClient = null;
  cloudReady = false;
  lastCloudUpdatedAt = "";
  localStorage.removeItem(CLOUD_KEY_STORAGE);
  updateSaveStatus(`Local ${localTimeLabel()}`);
  updateCloudStatus("Sin nube");
  renderCloudControls();
  showToast("Sincronización desactivada en este dispositivo");
}

function updateCloudStatus(message) {
  const status = $("#cloudStatus");
  if (status) status.textContent = message;
}

function startCloudWatch() {
  if (cloudWatchStarted) return;
  cloudWatchStarted = true;
  window.setInterval(() => pullCloudState(), 30000);
  window.addEventListener("focus", () => pullCloudState(true));
}

function freshState() {
  return {
    ...structuredClone(defaultState),
    createdAt: new Date().toISOString()
  };
}

function resetLocalState() {
  state = freshState();
  saveState();
  render();
  showToast("Registro reiniciado");
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

function totalHours() {
  return state.logs.reduce((sum, item) => sum + Number(item.hours || 0), 0);
}

function lastService(ruleId) {
  return state.services
    .filter((service) => service.type === ruleId)
    .sort((a, b) => parseStoredDate(b.date) - parseStoredDate(a.date))[0];
}

function hoursAt(date) {
  return state.logs
    .filter((item) => parseStoredDate(item.date) <= parseStoredDate(date))
    .reduce((sum, item) => sum + Number(item.hours || 0), 0);
}

function ruleProgress(rule) {
  const now = new Date();
  const total = totalHours();
  const previous = lastService(rule.id);
  const baseDate = previous ? parseStoredDate(previous.date) : parseStoredDate(state.createdAt);
  const baseHours = previous ? Number(previous.totalHours || hoursAt(previous.date)) : 0;
  const usedHours = Math.max(0, total - baseHours);
  const usedDays = Math.max(0, daysBetween(baseDate, now));
  const hourLimit = previous || !rule.firstHours ? rule.intervalHours : rule.firstHours;
  const dayLimit = previous || !rule.firstDays ? rule.intervalDays : rule.firstDays;
  const hoursLeft = hourLimit ? hourLimit - usedHours : null;
  const daysLeft = dayLimit ? dayLimit - usedDays : null;
  const hourPercent = hourLimit ? usedHours / hourLimit : 0;
  const dayPercent = dayLimit ? usedDays / dayLimit : 0;
  const percent = Math.min(1, Math.max(hourPercent, dayPercent));
  const due = (hoursLeft !== null && hoursLeft <= 0) || (daysLeft !== null && daysLeft <= 0);
  const urgent = (hoursLeft !== null && hoursLeft <= 5) || (daysLeft !== null && daysLeft <= 14);

  const title = !previous && rule.firstName ? rule.firstName : rule.name;
  return { rule, title, previous, usedHours, usedDays, hourLimit, dayLimit, hoursLeft, daysLeft, percent, due, urgent };
}

function render() {
  const total = totalHours();
  $("#totalHours").textContent = total.toFixed(1);
  renderDashboard();
  renderActivePerson();
  renderAlerts();
  renderBatteryCard();
  renderTasks();
  renderServiceCards();
  renderCareCards();
  renderPartsList();
  renderManualQuickButtons();
  renderSymptomButtons();
  renderUsageHistory();
  renderServiceHistory();
  renderCloudControls();
  renderSearch();
  renderEditMode();
}

function renderEditMode() {
  document.body.classList.toggle("edit-mode", editMode);
  const button = $("#editModeBtn");
  if (button) button.textContent = editMode ? "Salir edición" : "Edición";
}

function renderCloudControls() {
  const status = $("#cloudStatus");
  const cloudForm = $("#cloudForm");
  const disconnectButton = $("#cloudDisconnectBtn");
  const syncNowButton = $("#cloudSyncNowBtn");
  if (!status || !cloudForm || !disconnectButton || !syncNowButton) return;

  cloudForm.classList.toggle("hidden", Boolean(cloudKeyHash));
  disconnectButton.classList.toggle("hidden", !cloudKeyHash);
  syncNowButton.classList.toggle("hidden", !cloudKeyHash);

  if (!cloudKeyHash) {
    status.textContent = "Sin nube";
    updateSaveStatus(`Local ${localTimeLabel()}`);
  } else if (!cloudReady) {
    status.textContent = "Conectando...";
  } else if (!cloudSaving) {
    status.textContent = "Sincronización activa";
  }
}

function renderActivePerson() {
  if (!["Ana", "Jesus", "Jesús"].includes(state.activePerson)) state.activePerson = "Ana";
  document.querySelectorAll('input[name="registeredBy"]').forEach((input) => {
    input.checked = input.value === state.activePerson || (input.value === "Jesus" && state.activePerson === "Jesús");
  });
}

function sortedProgressItems() {
  return maintenanceRules.map(ruleProgress).sort((a, b) => urgencyScore(a) - urgencyScore(b));
}

function renderDashboard() {
  const usage = [...state.logs].sort((a, b) => parseStoredDate(b.date) - parseStoredDate(a.date));
  const items = sortedProgressItems();
  const urgent = items[0];
  const hasOverdue = items.some((item) => item.due);
  const hasSoon = items.some((item) => item.urgent || item.percent >= 0.75);
  const statusText = hasOverdue ? "Mantenimiento vencido" : hasSoon ? "Atención pronto" : "Todo al día";
  const statusClass = hasOverdue ? "overdue" : hasSoon ? "due" : "ok";

  $("#lastUse").textContent = usage[0] ? `${Number(usage[0].hours).toFixed(1)} h` : "Sin uso";
  $("#urgentTask").textContent = urgent ? `${urgent.title} · ${formatRemaining(urgent)}` : "Sin pendientes";
  $("#generalStatus").textContent = statusText;
  $("#generalStatusCard").className = `dash-card wide ${statusClass}`;
}

function statusFor(item) {
  if (item.due) return { label: item.rule.dueLabel, className: "overdue" };
  if ((item.hoursLeft !== null && item.hoursLeft <= 10) || (item.daysLeft !== null && item.daysLeft <= 15)) {
    return { label: item.rule.soonLabel, className: "due" };
  }
  if (item.rule.id === "battery-charge") return { label: "Preventivo", className: "preventive" };
  return { label: item.rule.doneLabel, className: "ok" };
}

function progressClass(item) {
  if (item.percent >= 0.9) return "red";
  if (item.percent >= 0.5) return "amber";
  return "green";
}

function renderAlerts() {
  const alerts = sortedProgressItems()
    .filter((item) => item.percent >= 0.75)
    .slice(0, 3);

  if (!alerts.length) {
    $("#alertsPanel").innerHTML = "";
    return;
  }

  $("#alertsPanel").innerHTML = alerts.map((item) => {
    const status = statusFor(item);
    const left = item.hoursLeft !== null
      ? `${Math.max(0, item.hoursLeft).toFixed(1)} h`
      : `${Math.max(0, item.daysLeft).toFixed(0)} días`;
    const phrase = item.due
      ? `${item.rule.icon} ${item.rule.dueLabel}: ${item.rule.target}`
      : `${item.rule.icon} En ${left} toca ${item.rule.action.toLowerCase()} ${item.rule.target}`;
    return `<div class="alert ${status.className}">${phrase}</div>`;
  }).join("");
}

function renderTasks() {
  const items = sortedProgressItems().slice(0, 8);

  $("#nextTasks").innerHTML = items.map((item) => {
    const status = statusFor(item);
    const hoursText = item.hourLimit ? `${item.usedHours.toFixed(1)}/${item.hourLimit} h` : "";
    const daysText = item.dayLimit ? `${item.usedDays}/${item.dayLimit} días` : "";
    const nextText = [hoursText, daysText].filter(Boolean).join(" · ");
    const remainingText = formatRemaining(item);
    const percent = Math.round(item.percent * 100);
    return `
      <div class="task">
        <div>
          <h3><span class="task-icon">${item.rule.icon}</span>${item.title}</h3>
          <p>${nextText}</p>
          <p class="remaining">${remainingText}</p>
          <div class="progress ${progressClass(item)}" aria-label="${percent}%">
            <span style="width: ${percent}%"></span>
          </div>
        </div>
        <span class="badge ${status.className}">Estado: ${status.label}</span>
      </div>
    `;
  }).join("");
}

function renderBatteryCard() {
  const latestUse = [...state.logs].sort((a, b) => parseStoredDate(b.date) - parseStoredDate(a.date))[0];
  const daysSinceUse = latestUse ? daysBetween(parseStoredDate(latestUse.date), new Date()) : Infinity;
  const ok = daysSinceUse < 30;
  $("#batteryCard").innerHTML = `
    <article class="battery-note ${ok ? "ok" : "preventive"}">
      <strong>Batería</strong>
      <p>${ok ? "Uso reciente, sin alerta por ahora." : "Revisar/cargar batería. La planta no se usa desde hace 30 días o más."}</p>
    </article>
  `;
}

function urgencyScore(item) {
  if (item.due) return -1000 + (item.rule.priority || 50) / 1000;
  if (item.hoursLeft !== null) return item.hoursLeft + (item.previous ? 0.25 : 0) + (item.rule.priority || 50) / 1000;
  if (item.daysLeft !== null) return 500 + item.daysLeft + (item.rule.priority || 50) / 1000;
  const remainingRatio = 1 - item.percent;
  const serviceFreshPenalty = item.previous ? 0.08 : 0;
  return 1000 + remainingRatio + serviceFreshPenalty + (item.rule.priority || 50) / 1000;
}

function formatLeft(value, unit) {
  if (value < 0) return `vencido por ${Math.abs(value).toFixed(unit === "h" ? 1 : 0)} ${unit}`;
  return `${value.toFixed(unit === "h" ? 1 : 0)} ${unit}`;
}

function formatRemaining(item) {
  if (item.due) return "Toca ahora";
  const hours = item.hoursLeft !== null ? `faltan ${item.hoursLeft.toFixed(1)} h` : "";
  const days = item.daysLeft !== null ? `faltan ${item.daysLeft.toFixed(0)} días` : "";
  return [hours, days].filter(Boolean).join(" · ");
}

function renderServiceCards() {
  $("#serviceCards").innerHTML = sortedProgressItems().map((item) => {
    const status = statusFor(item);
    const hoursInterval = item.hourLimit ? `${item.hourLimit} h` : "Sin horas";
    const daysInterval = item.dayLimit ? `${item.dayLimit} días` : "Sin fecha";
    const usedHours = item.hourLimit ? `${item.usedHours.toFixed(1)} h usadas` : "No depende de horas";
    const usedDays = `${item.usedDays} días pasados`;
    const leftHours = item.hoursLeft !== null ? `${Math.max(0, item.hoursLeft).toFixed(1)} h restantes` : "Sin límite por horas";
    const leftDays = item.daysLeft !== null ? `${Math.max(0, item.daysLeft).toFixed(0)} días restantes` : "Sin límite por fecha";
    const extra = item.rule.id === "oil"
      ? `<span>Aceite: SAE 10W-30 · capacidad 0.60 L</span>`
      : "";
    return `
      <article class="service-card ${status.className}">
        <div class="service-card-head">
          <h3><span class="task-icon">${item.rule.icon}</span>${item.title}</h3>
          <span class="badge ${status.className}">${status.label}</span>
        </div>
        <div class="service-metrics">
          <span>Intervalo: ${hoursInterval} · ${daysInterval}</span>
          <span>${usedHours}</span>
          <span>${usedDays}</span>
          <span>${leftHours}</span>
          <span>${leftDays}</span>
          ${extra}
        </div>
        <button type="button" class="done-button" data-service-id="${item.rule.id}">Hecho</button>
      </article>
    `;
  }).join("");
}

function renderCareCards() {
  $("#careCards").innerHTML = careCards.map((card) => `
    <div class="care">
      <h3>${card.title}</h3>
      <p>${card.body}</p>
    </div>
  `).join("");
}

function renderPartsList() {
  $("#partsList").innerHTML = partsList.map((part) => `
    <div class="part-item">
      <div>
        <span class="part-group">${part.group}</span>
        <h3>${part.name}</h3>
        <p>${part.buy}</p>
        <p>${part.details}</p>
        <small>${part.source}</small>
      </div>
      <strong>${part.part}</strong>
    </div>
  `).join("");
}

function renderManualQuickButtons() {
  $("#manualQuickButtons").innerHTML = manualQuickAnswers.map(([label]) => (
    `<button type="button" data-manual-topic="${label}">${label}</button>`
  )).join("");
}

function renderSymptomButtons() {
  $("#symptomButtons").innerHTML = symptomGuides.map(([label]) => (
    `<button type="button" data-symptom="${label}">${label}</button>`
  )).join("");
  if (!$("#symptomResult").innerHTML) {
    $("#symptomResult").innerHTML = `<div class="empty">Elige un síntoma para ver pasos seguros de revisión.</div>`;
  }
}

function renderUsageHistory() {
  const usage = [...state.logs].sort((a, b) => parseStoredDate(b.date) - parseStoredDate(a.date));

  if (!usage.length) {
    $("#usageHistory").innerHTML = `<div class="empty">Todavía no hay horas registradas.</div>`;
    const servicesHistory = $("#usageHistoryServices");
    if (servicesHistory) servicesHistory.innerHTML = `<div class="empty">Todavía no hay horas registradas.</div>`;
    return;
  }

  const markup = usage.slice(0, 12).map((item) => `
      <div class="history-item">
        <h3>${Number(item.hours).toFixed(1)} horas</h3>
        <p>${item.person || "Sin persona"} · ${formatVenezuelaDateTime(item.date)} · Total: ${Number(item.totalHours || 0).toFixed(1)} h</p>
        <button type="button" class="delete-button" data-delete-log="${item.id}">Eliminar</button>
      </div>
    `).join("");
  $("#usageHistory").innerHTML = markup;
  const servicesHistory = $("#usageHistoryServices");
  if (servicesHistory) servicesHistory.innerHTML = markup;
}

function renderServiceHistory() {
  $("#serviceHistory").innerHTML = maintenanceRules.map((rule) => {
    const services = state.services
      .filter((item) => item.type === rule.id)
      .sort((a, b) => parseStoredDate(b.date) - parseStoredDate(a.date));
    const body = services.length
      ? services.slice(0, 5).map((item) => `
          <div class="history-item compact">
            <p>${formatVenezuelaDateTime(item.date)} · Total: ${Number(item.totalHours || 0).toFixed(1)} h</p>
            <button type="button" class="delete-button" data-delete-service="${item.id}">Eliminar</button>
          </div>
        `).join("")
      : `<div class="empty compact">Sin registros todavía.</div>`;
    return `
      <section class="service-group">
        <div class="service-group-head">
          <h3>${rule.name}</h3>
          <span>${services.length}</span>
        </div>
        ${body}
      </section>
    `;
  }).join("");
}

function renderSearch() {
  const query = normalize($("#searchInput").value);
  const results = query
    ? knowledgeBase.filter((item) => normalize(`${item.title} ${item.tags} ${item.body}`).includes(query))
    : knowledgeBase.slice(0, 4);

  $("#searchResults").innerHTML = results.length
    ? results.map((item) => `<div class="result"><h3>${item.title}</h3><p>${item.body}</p></div>`).join("")
    : `<div class="empty">No encontré eso todavía. Prueba con aceite, horas, batería, bujía, gasolina o almacenamiento.</div>`;
}

function normalize(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

$("#hoursForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const hours = Number($("#hoursInput").value);
  if (!hours || hours <= 0) return;
  addUsage(hours);
});

function addUsage(hours) {
  state.logs.push({
    id: crypto.randomUUID(),
    date: nowISO(),
    person: state.activePerson,
    hours,
    totalHours: totalHours() + hours
  });
  $("#hoursInput").value = "";
  saveState();
  render();
  showToast(`${hours.toFixed(1)} h sumadas por ${state.activePerson}`);
}

function markServiceDone(type) {
  const rule = maintenanceRules.find((item) => item.id === type);
  state.services.push({
    id: crypto.randomUUID(),
    type,
    date: nowISO(),
    totalHours: totalHours()
  });
  saveState();
  render();
  showToast(`${rule?.name || "Servicio"} marcado como hecho`);
}

$("#searchInput").addEventListener("input", renderSearch);

document.addEventListener("click", (event) => {
  const quickHours = event.target.closest("[data-hours]");
  if (quickHours) {
    addUsage(Number(quickHours.dataset.hours));
    return;
  }

  const doneButton = event.target.closest("[data-service-id]");
  if (doneButton) {
    markServiceDone(doneButton.dataset.serviceId);
    return;
  }

  const deleteLogButton = event.target.closest("[data-delete-log]");
  if (deleteLogButton && editMode) {
    deleteLog(deleteLogButton.dataset.deleteLog);
    return;
  }

  const deleteServiceButton = event.target.closest("[data-delete-service]");
  if (deleteServiceButton && editMode) {
    deleteService(deleteServiceButton.dataset.deleteService);
    return;
  }

  const manualButton = event.target.closest("[data-manual-topic]");
  if (manualButton) {
    const answer = manualQuickAnswers.find(([label]) => label === manualButton.dataset.manualTopic);
    if (answer) $("#searchResults").innerHTML = `<div class="result"><h3>${answer[0]}</h3><p>${answer[1]}</p></div>`;
    return;
  }

  const symptomButton = event.target.closest("[data-symptom]");
  if (symptomButton) {
    const guide = symptomGuides.find(([label]) => label === symptomButton.dataset.symptom);
    if (guide) $("#symptomResult").innerHTML = `<div class="result"><h3>${guide[0]}</h3><p>${guide[1]}</p></div>`;
  }
});

function recalculateLogTotals() {
  let runningTotal = 0;
  [...state.logs]
    .sort((a, b) => parseStoredDate(a.date) - parseStoredDate(b.date))
    .forEach((item) => {
      runningTotal += Number(item.hours || 0);
      item.totalHours = runningTotal;
    });
}

function deleteLog(id) {
  const item = state.logs.find((entry) => entry.id === id);
  if (!item) return;
  if (!confirm(`¿Eliminar este registro de ${Number(item.hours).toFixed(1)} horas?`)) return;
  state.logs = state.logs.filter((entry) => entry.id !== id);
  recalculateLogTotals();
  saveState();
  render();
  showToast("Registro de horas eliminado");
}

function deleteService(id) {
  const item = state.services.find((entry) => entry.id === id);
  const rule = maintenanceRules.find((ruleItem) => ruleItem.id === item?.type);
  if (!item) return;
  if (!confirm(`¿Eliminar este servicio: ${rule?.name || "Servicio"}?`)) return;
  state.services = state.services.filter((entry) => entry.id !== id);
  saveState();
  render();
  showToast("Servicio eliminado");
}

document.querySelectorAll('input[name="registeredBy"]').forEach((input) => {
  input.addEventListener("change", () => {
    state.activePerson = input.value;
    saveState();
  });
});

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => {
    const tabName = button.dataset.tab;
    document.querySelectorAll(".tab-button").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `tab-${tabName}`);
    });
  });
});

const editModeButton = $("#editModeBtn");
if (editModeButton) {
  editModeButton.addEventListener("click", () => {
    if (editMode) {
      editMode = false;
      editTapCount = 0;
      renderEditMode();
      showToast("Modo edición desactivado");
      return;
    }

    editTapCount += 1;
    if (editTapCount < 5) {
      showToast(`Toca ${5 - editTapCount} veces más para activar edición`);
      return;
    }

    editMode = true;
    editTapCount = 0;
    renderEditMode();
    showToast("Modo edición activado");
  });
}

$("#exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `respaldo-planta-igen5000-${todayISO()}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

$("#exportTextBtn").addEventListener("click", () => {
  const items = sortedProgressItems().slice(0, 5);
  const lines = [
    "Resumen Control Planta iGen5000",
    `Horas totales: ${totalHours().toFixed(1)} h`,
    `Último uso: ${$("#lastUse").textContent}`,
    `Estado general: ${$("#generalStatus").textContent}`,
    "",
    "Próximos mantenimientos:",
    ...items.map((item) => `- ${item.title}: ${formatRemaining(item)}`),
    "",
    "Horas por persona:",
    `- Ana: ${hoursByPerson("Ana").toFixed(1)} h`,
    `- Jesus: ${hoursByPerson("Jesus").toFixed(1)} h`
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `resumen-planta-igen5000-${todayISO()}.txt`;
  link.click();
  URL.revokeObjectURL(url);
});

function hoursByPerson(person) {
  return state.logs
    .filter((item) => item.person === person || (person === "Jesus" && item.person === "Jesús"))
    .reduce((sum, item) => sum + Number(item.hours || 0), 0);
}

$("#importInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const imported = JSON.parse(await file.text());
  if (!Array.isArray(imported.logs) || !Array.isArray(imported.services)) {
    alert("Ese archivo no parece un respaldo válido de esta app.");
    return;
  }
  state = imported;
  saveState();
  render();
});

$("#cloudForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  await connectCloudWithKey($("#cloudKeyInput").value);
  $("#cloudKeyInput").value = "";
});

$("#cloudSyncNowBtn").addEventListener("click", async () => {
  await pullCloudState(true);
  await pushCloudState();
  showToast("Sincronización revisada");
});

$("#cloudDisconnectBtn").addEventListener("click", () => {
  if (!confirm("¿Quitar la nube de este teléfono? Los datos en Supabase no se borran.")) return;
  disconnectCloud();
});

$("#resetBtn").addEventListener("click", () => {
  if (!confirm("¿Seguro que quieres borrar el registro de esta planta en este navegador?")) return;
  resetLocalState();
});

$("#demoResetBtn").addEventListener("click", () => {
  resetLocalState();
});

render();

if (cloudKeyHash) {
  startCloudWatch();
  pullCloudState();
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js").catch(() => {});
}
