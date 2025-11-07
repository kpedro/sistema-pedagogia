import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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

  const htmlDocxModule = await import("html-docx-js/build/api.js");
  const htmlDocx = (htmlDocxModule.default ?? htmlDocxModule) as {
    asBlob: (html: string, options?: unknown) => Buffer;
  };

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

  const blobOrBuffer = htmlDocx.asBlob(html);
  const maybeBlob = blobOrBuffer as unknown;
  const body =
    maybeBlob && typeof (maybeBlob as Blob).arrayBuffer === "function"
      ? await (maybeBlob as Blob).arrayBuffer()
      : (blobOrBuffer as BodyInit);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${document.number ?? "documento"}.docx"`
    }
  });
}
