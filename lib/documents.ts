import type { Prisma, PrismaClient } from "@prisma/client";
import type { DocumentStatus } from "@/constants/enums";
import { addDays, startOfYear } from "date-fns";

type Tx = Prisma.TransactionClient | PrismaClient;

function buildDocumentNumber(type: string, schoolCode: string, year: number, seq: number) {
  return `${type}-${schoolCode}/${year}-${seq.toString().padStart(4, "0")}`;
}

async function getSchoolCode(tx: Tx, schoolId: string) {
  const school = await tx.school.findUnique({ where: { id: schoolId } });
  if (!school) {
    throw new Error("Escola nao encontrada");
  }
  return school.code;
}

async function nextSequence(tx: Tx, schoolId: string, type: string, schoolCode: string) {
  const year = new Date().getFullYear();
  const prefix = `${type}-${schoolCode}/${year}-`;

  const lastNumber = await tx.document.findFirst({
    where: {
      schoolId,
      OR: [
        { number: { startsWith: prefix } },
        { provisionalNumber: { startsWith: prefix } }
      ]
    },
    orderBy: { createdAt: "desc" },
    select: { number: true, provisionalNumber: true }
  });

  const extract = (value?: string | null) => {
    if (!value) return 0;
    const parts = value.split("-");
    const seq = parts[parts.length - 1];
    return Number(seq) || 0;
  };

  const lastSeq = Math.max(extract(lastNumber?.number), extract(lastNumber?.provisionalNumber));
  return { prefix, year, next: lastSeq + 1 };
}

export async function reserveDocumentNumber(
  tx: Tx,
  params: { documentId: string; schoolId: string; type: string; force?: boolean }
) {
  const document = await tx.document.findUnique({ where: { id: params.documentId } });

  if (!document) {
    throw new Error("Documento inexistente");
  }

  if (document.number) {
    return {
      number: document.number,
      provisionalNumber: document.provisionalNumber,
      reservedUntil: document.reservedUntil
    };
  }

  if (document.provisionalNumber && document.reservedUntil && document.reservedUntil > new Date() && !params.force) {
    return {
      provisionalNumber: document.provisionalNumber,
      reservedUntil: document.reservedUntil
    };
  }

  const schoolCode = await getSchoolCode(tx, params.schoolId);
  const { next, year } = await nextSequence(tx, params.schoolId, params.type, schoolCode);

  const provisionalNumber = buildDocumentNumber(params.type, schoolCode, year, next);

  const updated = await tx.document.update({
    where: { id: params.documentId },
    data: {
      provisionalNumber,
      reservedUntil: addDays(new Date(), 7)
    },
    select: {
      provisionalNumber: true,
      reservedUntil: true
    }
  });

  return updated;
}

export async function finalizeDocumentNumber(
  tx: Tx,
  params: { documentId: string; schoolId: string; type: string; approverId: string }
) {
  const document = await tx.document.findUnique({
    where: { id: params.documentId },
    select: { number: true, provisionalNumber: true, reservedUntil: true }
  });

  if (!document) {
    throw new Error("Documento inexistente");
  }

  if (document.number) {
    return document.number;
  }

  let finalNumber = document.provisionalNumber;

  if (!finalNumber || !document.reservedUntil || document.reservedUntil < new Date()) {
    const schoolCode = await getSchoolCode(tx, params.schoolId);
    const { next, year } = await nextSequence(tx, params.schoolId, params.type, schoolCode);
    finalNumber = buildDocumentNumber(params.type, schoolCode, year, next);
  }

  await tx.document.update({
    where: { id: params.documentId },
    data: {
      number: finalNumber,
      provisionalNumber: null,
      reservedUntil: null,
      approvedAt: new Date(),
      approvedById: params.approverId,
      status: "APPROVED"
    }
  });

  return finalNumber;
}

export async function recordRevision(
  tx: Tx,
  params: {
    documentId: string;
    version: number;
    status: DocumentStatus;
    content: string;
    changelog?: string | null;
    authorId: string;
  }
) {
  return tx.documentRevision.create({
    data: {
      documentId: params.documentId,
      version: params.version,
      status: params.status,
      content: params.content,
      changelog: params.changelog,
      createdById: params.authorId
    }
  });
}

export async function expireReservations(tx: Tx, schoolId: string) {
  const now = new Date();
  return tx.document.updateMany({
    where: {
      schoolId,
      status: "DRAFT",
      reservedUntil: { lt: now }
    },
    data: {
      provisionalNumber: null,
      reservedUntil: null
    }
  });
}

export async function lastYearDocumentsCount(tx: Tx, schoolId: string, type?: string) {
  return tx.document.count({
    where: {
      schoolId,
      type: type ? type : undefined,
      createdAt: { gte: startOfYear(new Date()) }
    }
  });
}
