export type ReferenceData = {
  students: Array<{
    id: string;
    name: string;
    registration: string;
    classId: string | null;
    className: string | null;
  }>;
  classes: Array<{
    id: string;
    name: string;
    grade: string | null;
    shift: string | null;
  }>;
  templates: Array<{
    id: string;
    title: string;
    code: string | null;
    type: string;
    schoolId: string | null;
  }>;
};

export async function fetchReferenceData(): Promise<ReferenceData> {
  const res = await fetch("/api/reference");
  if (!res.ok) {
    throw new Error("Erro ao carregar dados de referencia");
  }
  return res.json();
}
