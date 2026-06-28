import { SESSION_KEY } from "./constants";

export function getSessionProviderId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionProviderId(id: string): void {
  localStorage.setItem(SESSION_KEY, id);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}
