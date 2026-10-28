// Única fuente de verdad para el formulario y el panel de administración.
window.CFG = {
  // URL del Web App de Apps Script (/exec). Se completa después del despliegue.
  API_URL: "https://script.google.com/macros/s/AKfycby1NnOHNJ2tqFg6mnKyRHTbiSbpwOSJ6_QtC9kw9nI5TDSseHSHwvz0nLxQ6bCFv2oP/exec",
  // Dirección que codifica el QR. Vacío = la carpeta donde está admin.html.
  FORM_URL: "",

  NAMES: [
    "Alejandro Osorio Loaiza", "Alexander de Jesús Ossa Calvo", "Carolina Londoño Gallego",
    "Claudia Patricia Herrera Tellez", "Cristian Hely Florez Rodríguez", "David Steven Betancourth Gaitán",
    "Jhon Jairo Franco Arenas", "Juan Gabriel Alzate Gallego", "Libardo Andrés Acosta Hurtado",
    "Lucelly Giraldo Sierra", "Luis Gabriel Suárez Giraldo", "Santiago Ramírez García",
    "Yeison Suárez Suárez", "Yohan Sebastián Molano Muñoz", "Jaqueline Loaiza Parra",
    "José Fernando Tobón Rodríguez", "Simón Cárdenas Sánchez", "Federico Castillón Salazar",
    "Jonathan Gerardo Orozco Herrera", "José Daniel García Echeverry"
  ],

  // Borradores: se reemplazan por las preguntas definitivas.
  SCALE: [
    { t: "Organización y logística", d: "Convocatoria, lugar, horarios y condiciones del encuentro." },
    { t: "Claridad de los objetivos", d: "Se entendió para qué era el Microcentro y qué se esperaba de nosotros." },
    { t: "Utilidad de los contenidos", d: "Lo que se trató me sirve para mi trabajo con los caficultores." },
    { t: "Manejo del tiempo", d: "La agenda se cumplió y cada tema tuvo su espacio." },
    { t: "Participación del equipo", d: "Hubo diálogo, escucha y aportes de los Padrinos." },
    { t: "Experiencia general", d: "Qué tan satisfecho quedé con el Microcentro." }
  ],
  OPEN: [
    { t: "Lo más valioso", d: "¿Qué fue lo mejor del Microcentro? Lo que te llevas en la maleta.", ph: "Escribe lo que más te sirvió o te gustó…" },
    { t: "Para el próximo", d: "¿Qué debemos mejorar o cambiar en el siguiente Microcentro?", ph: "Escribe tu propuesta de mejora…" }
  ],
  VERDICT: ["", "¡Espantoso!", "Podría mejorar", "Aceptable", "¡Muy bueno!", "¡Monstruosamente bueno!"]
};
CFG.NAMES.sort((a, b) => a.localeCompare(b, "es"));

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const slug = (n) => n.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const first = (n) => n.split(" ")[0];

// GET con parámetros, o POST con cuerpo JSON (text/plain evita el preflight de CORS en Apps Script).
async function api(params, body) {
  if (!CFG.API_URL) throw new Error("API_URL vacío");
  const res = body
    ? await fetch(CFG.API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) })
    : await fetch(CFG.API_URL + "?" + new URLSearchParams(params));
  const out = await res.json();
  if (!out.ok) throw new Error(out.error || "error");
  return out;
}
