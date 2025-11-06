import { parse } from "csv-parse/sync";
import { z } from "zod";

const recordSchema = z.object({
  matricula: z.string().min(1),
  aluno: z.string().min(1),
  turma: z.string().min(1),
  disciplina: z.string().min(1),
  media: z
    .string()
    .transform((value) => Number(value.replace(",", ".").trim()))
    .pipe(z.number().min(0).max(10)),
  frequencia: z
    .string()
    .transform((value) => Number(value.replace(",", ".").trim()))
    .pipe(z.number().min(0).max(100)),
  periodo: z.string().min(1),
  ocorrenciasGraves: z
    .string()
    .optional()
    .transform((value) => Number(value?.trim() ?? "0"))
    .pipe(z.number().min(0))
});

export type GradeCsvRecord = z.infer<typeof recordSchema>;

export function parseGradeCsv(buffer: Buffer | string) {
  const raw = typeof buffer === "string" ? buffer : buffer.toString("utf8");
  const records = parse(raw, {
    delimiter: ";",
    bom: true,
    columns: true,
    skipEmptyLines: true,
    trim: true
  });

  const parsed: GradeCsvRecord[] = [];
  const errors: Array<{ line: number; message: string }> = [];

  records.forEach((row: unknown, index: number) => {
    const result = recordSchema.safeParse(row);
    if (result.success) {
      parsed.push(result.data);
    } else {
      errors.push({ line: index + 2, message: result.error.message });
    }
  });

  return { parsed, errors };
}
