const API_BASE_URL = "http://54.232.227.118";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  user?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface RegisterRequest {
  firstname: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  message?: string;
  errors?: Record<string, string[]> | string[];
  [key: string]: unknown;
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/Users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message || `Erro ao fazer login. Código: ${response.status}`
    );
  }

  return response.json();
}

export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/DailyFitness/Users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (errorData) {
      throw new Error(JSON.stringify(errorData));
    }
    throw new Error(`Erro ao cadastrar. Código: ${response.status}`);
  }

  return response.json();
}
