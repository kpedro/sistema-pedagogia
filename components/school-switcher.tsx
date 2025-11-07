"use client";

import { useSession } from "next-auth/react";
import { useTransition, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

export function SchoolSwitcher() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const schools = session?.user?.schools ?? [];
  const currentSchoolId = session?.user?.schoolId;

  if (!session?.user || !currentSchoolId || schools.length <= 1) {
    return null;
  }

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextSchoolId = event.target.value;
    if (!nextSchoolId || nextSchoolId === currentSchoolId) return;

    startTransition(async () => {
      await update({ schoolId: nextSchoolId });
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col text-xs font-semibold text-slate-500">
      <span className="mb-1">Escola</span>
      <select
        aria-label="Alterar escola ativa"
        value={currentSchoolId}
        onChange={handleChange}
        disabled={isPending}
        className="min-w-[200px] rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {schools.map((school) => (
          <option key={school.schoolId} value={school.schoolId}>
            {(school.schoolName ?? school.schoolCode ?? school.schoolId) + " • " + school.role}
          </option>
        ))}
      </select>
    </div>
  );
}
