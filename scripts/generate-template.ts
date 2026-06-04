import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

const wb = XLSX.utils.book_new();

const players = [
  {
    nombre: "Mateo",
    apellido: "Hernández",
    equipo: "Lobos Norte",
    numero: "7",
    posicion: "Base",
    categoria: "2007-2009",
    genero: "Varonil",
  },
];
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(players), "Players");

const teams = [
  {
    nombre: "Lobos Norte",
    genero: "Varonil",
    categoriadivision: "2007-2009",
    ciudad: "Chihuahua",
    logo: "https://placehold.co/120x120",
    entrenadores: "Coach García",
    descripcion: "Programa elite",
  },
];
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teams), "Teams");

const settings = [
  { campo: "nombre_organizacion", valor: "The North Classic" },
  { campo: "email", valor: "info@thenorthclassic.mx" },
  { campo: "telefono", valor: "+52 81 0000 0000" },
  { campo: "whatsapp", valor: "+52 81 0000 0000" },
  { campo: "genero", valor: "Varonil,Femenil" },
  { campo: "categoria_division", valor: "2007-2009,2010-2011" },
  { campo: "titulo_torneo", valor: "The North Classic 2026" },
  { campo: "fecha_inicio", valor: "2026-06-14" },
  { campo: "fecha_fin", valor: "2026-06-18" },
  { regla: "Partidos de 4 cuartos de 8 minutos" },
  { pregunta: "¿Cómo registro mi equipo?", respuesta: "Desde el formulario en línea." },
  { patrocinador: "Tiago Shoots", sitio: "https://instagram.com", logo: "" },
  {
    liderstat: "2007-2009|Varonil|points|mateo-hernandez",
  },
];
XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.json_to_sheet(settings),
  "Basic Settings"
);

const out = path.join(process.cwd(), "public/plantilla-north-classic.xlsx");
XLSX.writeFile(wb, out);
console.log("Written", out);
