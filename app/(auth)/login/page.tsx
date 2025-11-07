"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(8, "Senha mínima de 8 caracteres"),
  otp: z.string().optional()
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") ?? "/dashboard";
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const toRelativePath = (url?: string | null) => {
    if (!url) return callbackUrl;
    try {
      const parsed = new URL(url, window.location.origin);
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return callbackUrl;
    }
  };

  const onSubmit = async (values: FormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        ...values,
        callbackUrl,
        redirect: false
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      const targetUrl = toRelativePath(result?.url ?? callbackUrl);
      router.replace(targetUrl);
    } catch (err) {
      console.error("Erro ao autenticar", err);
      setError("Falha inesperada ao autenticar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-slate-800">Acessar o sistema</h1>
        <p className="mt-2 text-sm text-slate-500">Use suas credenciais institucionais</p>

        <form
          className="mt-6 space-y-4"
          method="post"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label className="text-sm font-medium text-slate-700">E-mail</label>
            <input
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/50"
              {...register("email")}
            />
            {formState.errors.email && (
              <p className="mt-1 text-sm text-red-500">{formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Senha</label>
            <input
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/50"
              {...register("password")}
            />
            {formState.errors.password && (
              <p className="mt-1 text-sm text-red-500">{formState.errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Código 2FA (Admin/Pedagogo)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={6}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/50"
              {...register("otp")}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-8 text-xs text-slate-400">
          TODO Fase2: recuperação de senha e onboarding simplificado.
        </p>
      </div>
    </main>
  );
}
