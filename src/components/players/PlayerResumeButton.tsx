"use client";

import { jsPDF } from "jspdf";

type ResumeData = {
  name: string;
  team: string;
  position: string;
  height: string;
  weight: string;
  jersey: string;
  age: string;
  achievements: string[];
  bio: string;
};

export function PlayerResumeButton({ data }: { data: ResumeData }) {
  const generate = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    doc.setFontSize(22);
    doc.setTextColor(155, 17, 30);
    doc.text("THE NORTH CLASSIC", margin, y);
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Resumen de jugador", margin, y);
    y += 15;

    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text(data.name, margin, y);
    y += 12;

    doc.setFontSize(11);
    const lines = [
      `Equipo: ${data.team}`,
      `Posición: ${data.position}`,
      `Jersey: ${data.jersey}`,
      `Altura: ${data.height}`,
      `Peso: ${data.weight}`,
      `Edad: ${data.age}`,
    ];
    lines.forEach((line) => {
      doc.text(line, margin, y);
      y += 7;
    });

    y += 5;
    doc.setFontSize(12);
    doc.text("Logros destacados", margin, y);
    y += 8;
    doc.setFontSize(10);
    data.achievements.forEach((a) => {
      doc.text(`• ${a}`, margin, y);
      y += 6;
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
    });

    y += 8;
    doc.setFontSize(12);
    doc.text("Biografía", margin, y);
    y += 8;
    doc.setFontSize(10);
    const bioLines = doc.splitTextToSize(data.bio || "—", 170);
    doc.text(bioLines, margin, y);

    doc.save(`${data.name.replace(/\s+/g, "-").toLowerCase()}-north-classic.pdf`);
  };

  return (
    <button type="button" onClick={generate} className="btn-secondary">
      Descargar resumen PDF
    </button>
  );
}
