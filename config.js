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

  // Escala: 1 = Por fortalecer ... 4 = Excelente.
  MAX: 4,
  LEVELS: ["", "Por fortalecer", "Aceptable", "Bueno", "Excelente"],
  VERDICT: ["", "Por fortalecer", "Aceptable", "¡Bueno!", "¡Excelente!"],

  SECTIONS: [
    { t: "Componente administrativo", d: "Valora cada afirmación según lo observado durante el microcentro.", items: [
      { l: "Administrativo: actividades y Guía 34", t: "Las actividades propuestas facilitaron la comprensión de la Guía 34 desde la gestión administrativa." },
      { l: "Administrativo: estrategias y necesidades de las IE", t: "Las estrategias utilizadas permitieron relacionar la temática con situaciones y necesidades de las instituciones educativas." }
    ] },
    { t: "Componente curricular", d: "Valora cada afirmación según lo observado durante el microcentro.", items: [
      { l: "Curricular: actividades y Guía 34", t: "Las actividades facilitaron la comprensión de la Guía 34 desde la gestión académica y curricular." },
      { l: "Curricular: prácticas, evaluación y aprendizajes", t: "El abordaje temático permitió establecer relaciones con las prácticas pedagógicas, la evaluación y el mejoramiento de los aprendizajes." }
    ] },
    { t: "Componente de capacitación", d: "Valora cada afirmación según lo observado durante el microcentro.", items: [
      { l: "Capacitación: apropiación de la Guía 34", t: "Las actividades propuestas favorecieron la comprensión y apropiación de los elementos de la Guía 34." },
      { l: "Capacitación: participación y construcción colectiva", t: "Las estrategias metodológicas promovieron la participación, el intercambio de experiencias y la construcción colectiva de aprendizajes." }
    ] },
    { t: "Componente comunitario", d: "Valora cada afirmación según lo observado durante el microcentro.", items: [
      { l: "Comunitario: institución, familias y comunidad", t: "Las actividades facilitaron la comprensión de la Guía 34 desde la relación entre la institución educativa, las familias y la comunidad." },
      { l: "Comunitario: participación y contexto", t: "El abordaje temático permitió reconocer posibilidades para fortalecer la participación y el vínculo con el contexto." }
    ] },
    { t: "Desarrollo general del microcentro", d: "Valora cada afirmación según lo observado durante el microcentro.", items: [
      { l: "General: organización y secuencia", t: "La organización y secuencia de las actividades favorecieron el desarrollo del microcentro." },
      { l: "General: metodología y diálogo", t: "La metodología utilizada promovió la participación activa y el diálogo entre los padrinos." },
      { l: "General: distribución del tiempo", t: "La distribución del tiempo fue adecuada para desarrollar las actividades propuestas." },
      { l: "General: claridad y pertinencia de la Guía 34", t: "El abordaje de la Guía 34 fue claro, pertinente y relacionado con la práctica educativa." },
      { l: "General: aprendizajes y aplicación", t: "El microcentro permitió construir aprendizajes y reconocer posibilidades de aplicación en el acompañamiento institucional." }
    ] }
  ],
  OPEN: [
    { t: "Lo más valioso", d: "¿Qué fue lo más valioso del desarrollo del microcentro?", ph: "Escribe aquí tu respuesta…" },
    { t: "Aspectos por mejorar", d: "¿Qué aspectos debemos mejorar en el desarrollo de las actividades o el abordaje temático?", ph: "Escribe aquí tu respuesta…" },
    { t: "Para el próximo microcentro", d: "¿Qué sugerimos para el próximo microcentro?", ph: "Escribe aquí tu respuesta…" }
  ]
};
CFG.SCALE = CFG.SECTIONS.flatMap((s) => s.items.map((i) => ({ ...i, s: s.t })));
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
