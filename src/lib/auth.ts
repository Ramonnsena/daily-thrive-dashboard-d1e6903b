const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function saveAuth(token: string, user?: Record<string, unknown>) {
  localStorage.setItem(TOKEN_KEY, token);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): Record<string, unknown> | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Decodifica o payload de um JWT sem validar a assinatura.
 * Retorna null se o token for inválido.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Verifica se o token JWT armazenado ainda é válido (não expirou).
 * Se o token não tiver claim `exp`, considera válido (apenas presença).
 * Se estiver expirado, limpa o storage automaticamente.
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload) {
    // Token presente mas não-JWT decodificável: considera válido pela presença.
    return true;
  }

  const exp = typeof payload.exp === "number" ? payload.exp : null;
  if (exp === null) {
    // Sem expiração declarada: considera válido.
    return true;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (exp <= nowSeconds) {
    // Expirou: limpa para forçar novo login.
    clearAuth();
    return false;
  }

  return true;
}
