import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale";

export function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export function formatManaus(date: Date | string, pattern = "dd/MM/yyyy") {
  return formatInTimeZone(date, "America/Manaus", pattern, { locale: ptBR });
}

export function parseBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return ["true", "1", "on", "yes"].includes(value.toLowerCase());
  }
  return fallback;
}

export function maskCpf(raw: string) {
  const onlyDigits = raw.replace(/\D/g, "").slice(0, 11);
  return onlyDigits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskPhoneAm(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}
