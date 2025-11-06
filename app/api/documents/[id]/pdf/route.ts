import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderDocumentPdf } from "@/lib/pdf";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      school: true,
      createdBy: true
    }
  });

  if (!document) {
    return NextResponse.json({ error: "Documento nao encontrado" }, { status: 404 });
  }

  const html = `
    <article>
      <header>
        <h1>${document.title}</h1>
        <p>${document.school.name} - ${document.school.address ?? ""}</p>
        <p>No ${document.number ?? document.provisionalNumber ?? "--"} - ${new Date(
          document.createdAt
        ).toLocaleString("pt-BR")}</p>
      </header>
      ${document.content}
      <footer style="margin-top:16px;">
        <p>Responsavel: ${document.createdBy.name}</p>
      </footer>
    </article>
  `;

  const pdf = await renderDocumentPdf({ html });
  return new NextResponse(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${document.number ?? "documento"}.pdf"`
    }
  });
}
