import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import ShortcutListener from "@/components/shortcut-listener";
import { cn } from "@/lib/utils";
import { SchoolSwitcher } from "@/components/school-switcher";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/occurrences", label: "Ocorrências" },
  { href: "/interventions", label: "Intervenções" },
  { href: "/documents", label: "Documentos" },
  { href: "/templates", label: "Modelos" },
  { href: "/analysis", label: "Análises" },
  { href: "/timetable", label: "Horários & Espaços" },
  { href: "/events", label: "Eventos" },
  { href: "/import", label: "Importação CSV" },
  { href: "/studio", label: "Estúdio" },
  { href: "/users", label: "Usuários" },
  { href: "/pee", label: "PEE" },
  { href: "/reinforcement", label: "Reforço" }
];

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <ShortcutListener />
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              Sistema Pedagogia • {session.user.role}
            </h1>
            <p className="text-xs text-slate-500">
              {session.user.email} • Escola ativa: {session.user.schoolName ?? session.user.schoolId}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-6 text-sm text-slate-600">
              {NAV_LINKS.slice(0, 4).map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-slate-900">
                  {link.label}
                </Link>
              ))}
            </div>
            <SchoolSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 md:flex-row">
        <aside className="order-2 w-full md:order-1 md:w-60">
          <nav className="rounded-2xl bg-white p-4 shadow-md">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Navegação rápida
            </div>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block rounded-xl px-3 py-2 hover:bg-slate-100",
                      "focus:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand/40"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="order-1 w-full flex-1 md:order-2">{children}</main>
      </div>
    </div>
  );
}
