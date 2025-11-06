import { NextResponse } from "next/server";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: { school: true }
  });

  if (!document) {
    return NextResponse.json({ error: "Documento nao encontrado" }, { status: 404 });
  }

  const zip = new PizZip();
  const doc = new Docxtemplater(zip);

  doc.setData({
    titulo: document.title,
    numero: document.number ?? document.provisionalNumber ?? "--",
    escola: document.school.name,
    conteudo: document.content
  });

  try {
    doc.render();
  } catch (error) {
    console.error("Erro ao gerar DOCX", error);
    return NextResponse.json({ error: "Falha ao gerar DOCX" }, { status: 500 });
  }

  const arrayBuffer = doc.getZip().generate({ type: "arraybuffer" });

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${document.number ?? "documento"}.docx"`
    }
  });
}
