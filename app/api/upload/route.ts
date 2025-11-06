import { NextRequest } from "next/server";
import path from "node:path";
import { promises as fs } from "node:fs";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireUser, jsonOk, jsonError } from "@/lib/api";
import { USER_ROLE } from "@/constants/enums";

const ALLOWED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "audio/mpeg",
  "audio/webm",
  "video/mp4"
];

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requireUser(req, {
    roles: [USER_ROLE.ADMIN, USER_ROLE.GESTOR, USER_ROLE.SUBGESTOR, USER_ROLE.PEDAGOGO, USER_ROLE.PROFESSOR]
  });
  if ("response" in auth) return auth.response;

  const form = await req.formData();
  const scope = (form.get("scope")?.toString() ?? "document").toLowerCase();
  const refId = form.get("refId")?.toString() ?? null;

  const files = form.getAll("files").filter((item): item is File => item instanceof File);

  if (!files.length) {
    return jsonError("Envie pelo menos um arquivo", 400);
  }

  const uploadRoot = process.env.UPLOAD_ROOT ?? path.resolve("uploads");
  await fs.mkdir(uploadRoot, { recursive: true });

  let totalSize = 0;
  const maxPerFile = Number(process.env.MAX_UPLOAD_PER_FILE ?? 10_485_760);
  const maxPerForm = Number(process.env.MAX_UPLOAD_PER_FORM ?? 31_457_280);

  const saved = [];

  for (const file of files) {
    if (!ALLOWED_MIME.includes(file.type)) {
      return jsonError(`Formato não suportado: ${file.type}`, 415);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.byteLength > maxPerFile) {
      return jsonError(`Arquivo excede ${maxPerFile / 1024 / 1024}MB`, 413);
    }

    totalSize += buffer.byteLength;
    if (totalSize > maxPerForm) {
      return jsonError("Limite total excedido", 413);
    }

    const key = crypto.randomUUID();
    const extension = path.extname(file.name) || "";
    const fileName = `${Date.now()}-${key}${extension}`;
    const target = path.join(uploadRoot, fileName);

    await fs.writeFile(target, buffer);

    const attach = await prisma.attachment.create({
      data: {
        schoolId: auth.schoolId,
        fileName: file.name,
        path: target,
        mimeType: file.type,
        size: buffer.byteLength,
        uploadedById: auth.user.id,
        documentId: scope === "document" ? refId : null,
        occurrenceId: scope === "occurrence" ? refId : null,
        interventionId: scope === "intervention" ? refId : null,
        eventId: scope === "event" ? refId : null,
        resourceId: scope === "resource" ? refId : null,
        metadata: scope === "studio" ? JSON.stringify({ studio: true }) : null
      }
    });

    saved.push(attach);
  }

  return jsonOk({ attachments: saved });
}
