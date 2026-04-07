const API_BASE_URL = "";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
  } | null;
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
  const payload = { email: data.email, password: data.password };
  console.log("📤 Login request payload:", payload);

  const response = await fetch(`${API_BASE_URL}/DailyFitness/Users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json().catch(() => null);
  console.log("📥 Login response status:", response.status);
  console.log("📥 Login response data:", responseData);

  if (!response.ok) {
    throw new Error(
      responseData?.message || `Erro ao fazer login. Código: ${response.status}`
    );
  }

  return responseData as LoginResponse;
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
