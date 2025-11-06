"use client";

import { Card } from "@/components/ui/card";

const SAMPLE_TIMETABLE = [
  {
    className: "1º Ano A",
    weekday: "Segunda-feira",
    time: "07:30 - 08:20",
    subject: "Matemática",
    teacher: "Prof. João",
    room: "Sala 01"
  },
  {
    className: "1º Ano A",
    weekday: "Segunda-feira",
    time: "08:20 - 09:10",
    subject: "Língua Portuguesa",
    teacher: "Profa. Ana",
    room: "Sala 01"
  }
];

export default function TimetablePage() {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold text-slate-700">Horários & espaços</h2>
        <p className="text-sm text-slate-500">
          Estrutura base do timetable. TODO Fase2: CRUD completo e detecção automática de conflitos.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left">Turma</th>
                <th className="px-3 py-2 text-left">Dia</th>
                <th className="px-3 py-2 text-left">Horário</th>
                <th className="px-3 py-2 text-left">Disciplina</th>
                <th className="px-3 py-2 text-left">Professor</th>
                <th className="px-3 py-2 text-left">Sala</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_TIMETABLE.map((item, index) => (
                <tr key={index}>
                  <td className="px-3 py-2">{item.className}</td>
                  <td className="px-3 py-2">{item.weekday}</td>
                  <td className="px-3 py-2">{item.time}</td>
                  <td className="px-3 py-2">{item.subject}</td>
                  <td className="px-3 py-2">{item.teacher}</td>
                  <td className="px-3 py-2">{item.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-700">Reservas e conflitos</h2>
        <p className="text-sm text-slate-500">
          TODO Fase2: interface para reservas com sugestões de realocação (±45 min) e registro de override.
        </p>
      </Card>
    </div>
  );
}
