"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";

async function fetchUsers() {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Erro ao carregar usuários");
  return res.json();
}

export default function UsersPage() {
  const { data } = useQuery<{ users: Array<any> }>({
    queryKey: ["users"],
    queryFn: fetchUsers,
    retry: false
  });

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold text-slate-700">Usuários & Perfis</h2>
        <p className="text-sm text-slate-500">
          TODO Fase2: gerenciamento completo de usuários, convites e 2FA obrigatório por perfil.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left">Nome</th>
                <th className="px-3 py-2 text-left">E-mail</th>
                <th className="px-3 py-2 text-left">Perfil</th>
                <th className="px-3 py-2 text-left">Escola</th>
              </tr>
            </thead>
            <tbody>
              {data?.users?.map((user) => (
                <tr key={user.id}>
                  <td className="px-3 py-2">{user.name}</td>
                  <td className="px-3 py-2">{user.email}</td>
                  <td className="px-3 py-2">{user.role}</td>
                  <td className="px-3 py-2">{user.school?.name ?? "—"}</td>
                </tr>
              )) ?? (
                <tr>
                  <td className="px-3 py-4 text-sm text-slate-500" colSpan={4}>
                    Cadastre usuários via seed/Prisma Studio por enquanto.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
