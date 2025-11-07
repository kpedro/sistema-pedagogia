import { NextResponse } from "next/server";
import htmlDocx from "html-docx-js/dist/html-docx";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      school: true,
      createdBy: { select: { name: true } }
    }
  });

  if (!document) {
    return NextResponse.json({ error: "Documento nao encontrado" }, { status: 404 });
  }

  const html = `
    <article>
      <header>
        <h1>${document.title}</h1>
        <p>${document.school.name}</p>
        <p>Nº ${document.number ?? document.provisionalNumber ?? "--"} - ${new Date(document.createdAt).toLocaleString(
          "pt-BR"
        )}</p>
      </header>
      ${document.content}
      <footer style="margin-top:16px;">
        <p>Responsável: ${document.createdBy?.name ?? ""}</p>
      </footer>
    </article>
  `;

  const buffer = htmlDocx.asBuffer(html);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${document.number ?? "documento"}.docx"`
    }
  });
}
