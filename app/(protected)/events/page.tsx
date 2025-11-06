"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";

async function fetchEvents() {
  const res = await fetch("/api/events");
  if (!res.ok) throw new Error("Erro ao carregar eventos");
  return res.json();
}

export default function EventsPage() {
  const { data, error } = useQuery<{ events: Array<any> }>({
    queryKey: ["events"],
    queryFn: fetchEvents,
    retry: false
  });

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold text-slate-700">Eventos institucionais</h2>
        <p className="text-sm text-slate-500">
          TODO Fase2: CRUD completo, roteiro por etapa e integração com reservas.
        </p>
        {error && (
          <p className="mt-4 text-sm text-rose-500">
            API ainda não conectada; cadastrar eventos via Prisma Studio por enquanto.
          </p>
        )}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left">Título</th>
                <th className="px-3 py-2 text-left">Início</th>
                <th className="px-3 py-2 text-left">Fim</th>
                <th className="px-3 py-2 text-left">Local</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.events?.map((event) => (
                <tr key={event.id}>
                  <td className="px-3 py-2">{event.title}</td>
                  <td className="px-3 py-2">{new Date(event.startsAt).toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-2">{new Date(event.endsAt).toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-2">{event.location}</td>
                  <td className="px-3 py-2">{event.status}</td>
                </tr>
              )) ?? (
                <tr>
                  <td className="px-3 py-4 text-sm text-slate-500" colSpan={5}>
                    Registre eventos para vê-los aqui.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-700">Roteiro de evento</h2>
        <p className="text-sm text-slate-500">TODO Fase2: builder de roteiro com responsáveis e durações.</p>
      </Card>
    </div>
  );
}
